import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken, TOKEN_KEY } from '../api/client';
import { registerPushToken, unregisterPushToken } from '../lib/push';
import type { User } from '../types';

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const { data } = await api.get<User>('/auth/me');
          setUser(data);
          registerPushToken().catch(() => {});
        } catch {
          await setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ user: User; token: string }>('/auth/login', {
      email,
      password,
    });
    await setToken(data.token);
    setUser(data.user);
    registerPushToken().catch(() => {});
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ user: User; token: string }>('/auth/register', {
      name,
      email,
      password,
    });
    await setToken(data.token);
    setUser(data.user);
    registerPushToken().catch(() => {});
  };

  // Re-fetch the current user (e.g. after a subscription purchase changes is_premium).
  const refreshUser = async () => {
    try {
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      // keep the existing user on a transient failure
    }
  };

  const logout = async () => {
    await unregisterPushToken();
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
