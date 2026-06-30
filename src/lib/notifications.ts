import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Medication } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STORAGE_PREFIX = '@kinora/med-notif/';

export async function ensurePermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medications', {
      name: 'Medication reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1F3D2B',
    });
  }
  return status === 'granted';
}

export async function cancelMedicationReminders(medicationId: number): Promise<void> {
  const key = STORAGE_PREFIX + medicationId;
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return;
  const ids: string[] = JSON.parse(raw);
  for (const id of ids) {
    try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
  }
  await AsyncStorage.removeItem(key);
}

export async function scheduleMedicationReminders(
  medication: Pick<Medication, 'id' | 'name' | 'dosage' | 'times_of_day'>,
  recipientName: string,
): Promise<number> {
  await cancelMedicationReminders(medication.id);
  if (!medication.times_of_day || medication.times_of_day.length === 0) return 0;
  const granted = await ensurePermissions();
  if (!granted) return 0;

  const ids: string[] = [];
  for (const t of medication.times_of_day) {
    const m = t.match(/^(\d{2}):(\d{2})$/);
    if (!m) continue;
    const hour = parseInt(m[1], 10);
    const minute = parseInt(m[2], 10);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${recipientName} — ${medication.name}`,
        body: medication.dosage
          ? `Time for ${medication.dosage}. Tap to log.`
          : 'Time for the next dose. Tap to log.',
        data: { medicationId: medication.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    ids.push(id);
  }
  await AsyncStorage.setItem(STORAGE_PREFIX + medication.id, JSON.stringify(ids));
  return ids.length;
}
