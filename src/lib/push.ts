import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

const STORED_TOKEN_KEY = '@kinora/expo-push-token';

export async function registerPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let granted = existing === 'granted';
  if (!granted) {
    const { status } = await Notifications.requestPermissionsAsync();
    granted = status === 'granted';
  }
  if (!granted) return null;

  const projectId =
    (Constants.expoConfig as any)?.extra?.eas?.projectId ??
    (Constants.easConfig as any)?.projectId;

  let token: string;
  try {
    const result = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    token = result.data;
  } catch {
    return null;
  }

  const previous = await AsyncStorage.getItem(STORED_TOKEN_KEY);
  if (previous === token) return token;

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    await api.post('/devices', {
      expo_token: token,
      platform: Platform.OS,
      timezone: tz,
    });
    await AsyncStorage.setItem(STORED_TOKEN_KEY, token);
  } catch {
    // server unreachable — try again next launch
  }
  return token;
}

export async function unregisterPushToken(): Promise<void> {
  const token = await AsyncStorage.getItem(STORED_TOKEN_KEY);
  if (!token) return;
  try {
    await api.delete('/devices', { data: { expo_token: token } });
  } catch {
    // ignore
  }
  await AsyncStorage.removeItem(STORED_TOKEN_KEY);
}
