import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppText,
  Badge,
  Button,
  Card,
  Icon,
  Loading,
  PressableScale,
  Screen,
  SectionHeader,
} from '../components';
import { api } from '../api/client';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Appointment } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentDetail'>;

export default function AppointmentDetailScreen({ route }: Props) {
  const { appointmentId } = route.params;
  const { colors } = useTheme();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Appointment>(`/appointments/${appointmentId}`);
      setAppointment(data);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const suggest = async () => {
    setBusy('suggest');
    try {
      const { data } = await api.post<Appointment>(
        `/appointments/${appointmentId}/suggest-questions`,
        { language: 'en' },
      );
      setAppointment(data);
    } catch (e: any) {
      Alert.alert('Could not generate', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setBusy(null);
    }
  };

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone permission required.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (e: any) {
      Alert.alert('Could not start recording', e.message ?? 'Try again.');
    }
  };

  const stopAndSummarize = async () => {
    if (!recording) return;
    setBusy('upload');
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No file produced.');

      const form = new FormData();
      form.append('audio', { uri, name: 'recording.m4a', type: 'audio/m4a' } as any);
      form.append('language', 'en');

      const { data } = await api.post<Appointment>(
        `/appointments/${appointmentId}/transcribe`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setAppointment(data);
    } catch (e: any) {
      Alert.alert('Could not summarize', e?.response?.data?.message ?? e.message ?? 'Try again.');
    } finally {
      setBusy(null);
      setRecording(null);
    }
  };

  if (loading || !appointment) return <Loading label="Loading appointment…" />;

  const hasQuestions = !!appointment.suggested_questions?.length;

  return (
    <Screen scroll>
      {/* Header card */}
      <Animated.View entering={FadeInDown.duration(300)}>
        <Card>
          <AppText variant="title2">{appointment.title}</AppText>
          <View style={styles.metaRow}>
            <Icon name="clock" size="xs" color="textSecondary" />
            <AppText variant="subhead" color="textSecondary">
              {new Date(appointment.scheduled_at).toLocaleString()}
            </AppText>
          </View>
          {appointment.doctor && (
            <View style={styles.metaRow}>
              <Icon name="doctor" size="xs" color="textSecondary" />
              <AppText variant="subhead" color="textSecondary">
                {appointment.doctor}
              </AppText>
            </View>
          )}
        </Card>
      </Animated.View>

      {/* Questions to ask */}
      <View style={styles.section}>
        <SectionHeader
          title="Questions to ask"
          action={
            <PressableScale onPress={suggest} disabled={!!busy} style={styles.action}>
              <Icon name={hasQuestions ? 'refresh' : 'explain'} size="xs" color="primary" />
              <AppText variant="subhead" color="primary" weight="600">
                {busy === 'suggest' ? 'Generating…' : hasQuestions ? 'Refresh' : 'Generate'}
              </AppText>
            </PressableScale>
          }
        />
        <Card>
          {hasQuestions ? (
            appointment.suggested_questions!.map((q, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.duration(240).delay(i * 50)}
                style={[styles.qRow, i > 0 && { borderTopColor: colors.hairline, borderTopWidth: 1 }]}
              >
                <View style={[styles.qNum, { backgroundColor: colors.primarySoft }]}>
                  <AppText variant="caption" color="onPrimarySoft" weight="700">
                    {i + 1}
                  </AppText>
                </View>
                <AppText variant="body" style={{ flex: 1 }}>
                  {q}
                </AppText>
              </Animated.View>
            ))
          ) : (
            <AppText variant="callout" color="textSecondary">
              Let Kinora suggest a list tailored to “{appointment.title}”.
            </AppText>
          )}
        </Card>
      </View>

      {/* Recording & summary */}
      <View style={styles.section}>
        <SectionHeader title="Recording & summary" />

        {recording ? (
          <Card tone="alt" style={[styles.recCard, { borderColor: colors.accent }]}>
            <View style={styles.recRow}>
              <View style={[styles.recDot, { backgroundColor: colors.danger }]} />
              <AppText variant="subhead" weight="600">
                Recording in progress…
              </AppText>
            </View>
            <Button
              title={busy === 'upload' ? 'Summarising…' : 'Stop & summarise'}
              variant="danger"
              icon="stop"
              loading={busy === 'upload'}
              onPress={stopAndSummarize}
              style={{ marginTop: space.md }}
            />
          </Card>
        ) : !appointment.summary ? (
          <Card>
            <AppText variant="footnote" color="textSecondary" style={{ marginBottom: space.md }}>
              Record the visit and Kinora will turn it into a clear written summary.
            </AppText>
            <Button title="Start recording" icon="mic" onPress={startRecording} disabled={!!busy} />
          </Card>
        ) : null}

        {appointment.summary && (
          <Animated.View entering={FadeInDown.duration(320)}>
            <Card>
              <Badge label="AI summary" tone="success" icon="checkCircle" />
              <AppText variant="body" style={{ marginTop: space.md }}>
                {appointment.summary}
              </AppText>
              <View style={[styles.disclaimer, { borderTopColor: colors.hairline }]}>
                <Icon name="warning" size="xs" color="accent" />
                <AppText variant="caption" color="textTertiary" style={{ flex: 1 }}>
                  This is an AI summary of the recording. Always confirm critical points with the
                  doctor.
                </AppText>
              </View>
            </Card>
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  section: { marginTop: space.xl },
  action: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  qRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingVertical: space.md },
  qNum: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recCard: { borderWidth: 1.5 },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  recDot: { width: 12, height: 12, borderRadius: radius.pill },
  disclaimer: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'flex-start',
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
});
