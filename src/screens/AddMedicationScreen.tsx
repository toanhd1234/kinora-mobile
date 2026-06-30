import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Card, Chip, Icon, Input, Screen } from '../components';
import { api } from '../api/client';
import { scheduleMedicationReminders } from '../lib/notifications';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Medication } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMedication'>;

const TIME_PRESETS: { label: string; value: string }[] = [
  { label: 'Morning 08:00', value: '08:00' },
  { label: 'Noon 12:00', value: '12:00' },
  { label: 'Evening 20:00', value: '20:00' },
  { label: 'Night 22:00', value: '22:00' },
];

export default function AddMedicationScreen({ route, navigation }: Props) {
  const { recipientId, recipientName } = route.params;
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [times, setTimes] = useState('08:00');
  const [busy, setBusy] = useState(false);

  const parseTimes = (raw: string): string[] => {
    return raw
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter((t) => /^\d{2}:\d{2}$/.test(t));
  };

  const appendPreset = (value: string) => {
    setTimes((prev) => {
      const existing = parseTimes(prev);
      if (existing.includes(value)) return prev;
      return existing.length > 0 ? `${prev.trim()}, ${value}` : value;
    });
  };

  const onSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Medication name is required.');
      return;
    }
    const parsedTimes = parseTimes(times);
    setBusy(true);
    try {
      const { data } = await api.post<Medication>(`/care-recipients/${recipientId}/medications`, {
        name: name.trim(),
        dosage: dosage.trim() || null,
        instructions: instructions.trim() || null,
        times_of_day: parsedTimes,
        frequency: 'daily',
        is_active: true,
      });
      if (parsedTimes.length > 0) {
        await scheduleMedicationReminders(data, recipientName);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Could not save', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: colors.primarySoft }]}>
          <Icon name="meds" size="md" color="onPrimarySoft" />
        </View>
        <AppText variant="title1" weight="700">
          New medication
        </AppText>
        <AppText variant="subhead" color="textSecondary" style={styles.subtitle}>
          Add a medication and reminders for {recipientName}.
        </AppText>
      </Animated.View>

      <Card>
        <Input
          label="Name"
          required
          icon="meds"
          placeholder="e.g. Ramipril"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Dosage"
          icon="pill"
          placeholder="e.g. 5mg, 1 tablet"
          value={dosage}
          onChangeText={setDosage}
        />

        <View style={styles.presetRow}>
          {TIME_PRESETS.map((preset) => (
            <Chip
              key={preset.value}
              label={preset.label}
              selected={parseTimes(times).includes(preset.value)}
              onPress={() => appendPreset(preset.value)}
            />
          ))}
        </View>
        <Input
          label="Times"
          icon="clock"
          hint="24h format, comma separated e.g. 08:00, 20:00"
          placeholder="08:00, 20:00"
          value={times}
          onChangeText={setTimes}
          autoCapitalize="none"
        />

        <Input
          label="Instructions"
          icon="info"
          placeholder="e.g. After breakfast"
          value={instructions}
          onChangeText={setInstructions}
          multiline
        />
      </Card>

      <Button
        title={busy ? 'Saving…' : 'Save medication'}
        icon="check"
        size="lg"
        loading={busy}
        disabled={busy}
        onPress={onSubmit}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: space.xl },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  subtitle: { marginTop: space.xs },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.md,
  },
  submit: { marginTop: space.lg },
});
