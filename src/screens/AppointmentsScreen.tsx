import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Appointment } from '../types';
import {
  AnimatedItem,
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  Loading,
  Screen,
  SectionHeader,
} from '../components';
import { space } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Appointments'>;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function AppointmentsScreen({ route, navigation }: Props) {
  const { recipientId } = route.params;
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [when, setWhen] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Appointment[]>(
        `/care-recipients/${recipientId}/appointments`,
      );
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [recipientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const create = async () => {
    if (!title.trim() || !when.trim()) return;
    const iso = new Date(when.trim()).toISOString();
    await api.post(`/care-recipients/${recipientId}/appointments`, {
      title: title.trim(),
      doctor: doctor.trim() || null,
      scheduled_at: iso,
    });
    setTitle(''); setDoctor(''); setWhen('');
    await load();
  };

  if (loading) return <Loading />;

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Card elevation={1} style={styles.formCard}>
              <AppText variant="title3" style={styles.formHeading}>
                New appointment
              </AppText>
              <Input
                label="Title"
                icon="appointments"
                placeholder="Cardiology follow-up"
                value={title}
                onChangeText={setTitle}
              />
              <Input
                label="Doctor"
                icon="doctor"
                placeholder="Optional"
                value={doctor}
                onChangeText={setDoctor}
              />
              <Input
                label="When"
                icon="clock"
                placeholder="YYYY-MM-DD HH:MM"
                hint="e.g. 2026-07-01 14:30"
                autoCapitalize="none"
                value={when}
                onChangeText={setWhen}
              />
              <Button title="Add appointment" icon="add" onPress={create} />
            </Card>
            <SectionHeader title="Upcoming & past" />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="appointments"
            title="No appointments yet"
            description="Add the next doctor's visit to prep questions and capture a summary."
          />
        }
        renderItem={({ item, index }) => (
          <AnimatedItem index={index}>
            <Card
              elevation={1}
              style={styles.card}
              onPress={() =>
                navigation.navigate('AppointmentDetail', { appointmentId: item.id })
              }
            >
              <View style={styles.cardBody}>
                <AppText variant="headline">{item.title}</AppText>
                <View style={styles.metaRow}>
                  <Icon name="clock" size="xs" color="textTertiary" />
                  <AppText variant="footnote" color="textSecondary">
                    {formatDate(item.scheduled_at)}
                  </AppText>
                </View>
                {item.doctor && (
                  <View style={styles.metaRow}>
                    <Icon name="doctor" size="xs" color="textTertiary" />
                    <AppText variant="footnote" color="textSecondary">
                      {item.doctor}
                    </AppText>
                  </View>
                )}
                {item.summary && (
                  <View style={styles.summary}>
                    <Badge tone="info" icon="check" label="Summary ready" />
                    <AppText
                      variant="footnote"
                      color="textSecondary"
                      numberOfLines={2}
                      style={styles.summaryText}
                    >
                      {item.summary}
                    </AppText>
                  </View>
                )}
              </View>
              <Icon name="chevron" size="sm" color="textTertiary" />
            </Card>
          </AnimatedItem>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.huge },
  formCard: { marginBottom: space.lg },
  formHeading: { marginBottom: space.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.md,
  },
  cardBody: { flex: 1, gap: space.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  summary: { marginTop: space.xs, gap: space.xs },
  summaryText: { marginTop: 2 },
});
