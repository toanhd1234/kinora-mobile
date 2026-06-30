import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { navigateFromOutside } from '../navigation/navigationRef';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
  'http://localhost:8000/api';

export const TOKEN_KEY = '@kinora/token';

export const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 402 with code `premium_required` means a free-tier limit was hit — send the
// user to the paywall. The originating call still rejects so the screen can show
// the explanatory message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 402 &&
      error?.response?.data?.code === 'premium_required'
    ) {
      navigateFromOutside('Paywall');
    }
    return Promise.reject(error);
  },
);

export async function setToken(token: string | null) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}
