import { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppText,
  Badge,
  Button,
  Card,
  Icon,
  Input,
  ListRow,
  PressableScale,
  Screen,
  SectionHeader,
} from '../components';
import { api, TOKEN_KEY } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useThemePreference, type ThemePreference } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const THEME_OPTIONS: { key: ThemePreference; label: string; icon: 'sun' | 'moon' | 'settings' }[] = [
  { key: 'light', label: 'Light', icon: 'sun' },
  { key: 'dark', label: 'Dark', icon: 'moon' },
  { key: 'system', label: 'Auto', icon: 'settings' },
];

function initials(name?: string) {
  return (name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function SettingsScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { preference, setPreference } = useThemePreference();
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const exportData = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const url = (api.defaults.baseURL ?? '') + '/me/export';
      const fileUri = FileSystem.documentDirectory + 'kinora-export.zip';
      const res = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert(
        'Export saved',
        `Your data export was saved to:\n${res.uri}\n\nYou can share it from your file manager.`,
      );
    } catch (e: any) {
      Alert.alert('Export failed', e?.message ?? 'Try again later.');
    }
  };

  const deleteAccount = async () => {
    try {
      await api.post('/me/delete', { password: confirmPwd, confirmation: 'DELETE' });
      Alert.alert('Account deleted', 'All your data has been removed. Goodbye.');
      await logout();
    } catch (e: any) {
      Alert.alert(
        'Could not delete',
        e?.response?.data?.message ?? 'Check your password and try again.',
      );
    }
  };

  return (
    <Screen scroll>
      {/* Profile */}
      <Animated.View entering={FadeInDown.duration(300)}>
        <Card style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            <AppText variant="title2" color="onPrimarySoft" weight="700">
              {initials(user?.name)}
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="title3">{user?.name}</AppText>
            <AppText variant="footnote" color="textSecondary" style={{ marginTop: 2 }}>
              {user?.email}
            </AppText>
            {user?.is_premium && (
              <Badge label="Premium" tone="primary" icon="premium" style={{ marginTop: space.sm }} />
            )}
          </View>
        </Card>
      </Animated.View>

      {/* Appearance */}
      <View style={styles.section}>
        <SectionHeader title="Appearance" />
        <Card padded={false} style={{ padding: space.xs }}>
          <View style={styles.segment}>
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.key;
              return (
                <PressableScale
                  key={opt.key}
                  onPress={() => setPreference(opt.key)}
                  scaleTo={0.96}
                  style={[
                    styles.segmentItem,
                    { backgroundColor: active ? colors.primary : 'transparent' },
                  ]}
                >
                  <Icon name={opt.icon} size="sm" color={active ? 'onPrimary' : 'textSecondary'} />
                  <AppText
                    variant="subhead"
                    weight="600"
                    color={active ? 'onPrimary' : 'textSecondary'}
                  >
                    {opt.label}
                  </AppText>
                </PressableScale>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Subscription */}
      <View style={styles.section}>
        <SectionHeader title="Subscription" />
        <ListRow
          icon="premium"
          iconTone="accent"
          title={user?.is_premium ? 'Manage Premium' : 'Upgrade to Premium'}
          subtitle="Unlimited AI, family sharing, document vault."
          onPress={() => navigation.navigate('Paywall')}
        />
      </View>

      {/* Data & privacy */}
      <View style={styles.section}>
        <SectionHeader title="Your data (GDPR)" />
        <View style={{ gap: space.sm }}>
          <ListRow
            icon="download"
            iconTone="primary"
            title="Export my data"
            subtitle="Download a ZIP of everything Kinora stores about you."
            onPress={exportData}
          />
          <ListRow
            icon="trash"
            destructive
            title="Delete my account"
            subtitle="Permanently erase all your data and memberships."
            onPress={() => setShowDelete((s) => !s)}
          />
        </View>

        {showDelete && (
          <Animated.View entering={FadeInDown.duration(220)}>
            <Card tone="alt" style={[styles.deleteBox, { borderColor: colors.danger }]}>
              <View style={styles.deleteHead}>
                <Icon name="warning" size="sm" color="danger" />
                <AppText variant="subhead" color="danger" weight="600" style={{ flex: 1 }}>
                  This cannot be undone
                </AppText>
              </View>
              <AppText variant="footnote" color="textSecondary" style={{ marginBottom: space.md }}>
                All medications, documents and recordings tied to recipients you own will be
                permanently deleted.
              </AppText>
              <Input
                placeholder="Enter your password to confirm"
                secureTextEntry
                icon="lock"
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                containerStyle={{ marginBottom: space.md }}
              />
              <Button
                title="Delete my account permanently"
                variant="danger"
                icon="trash"
                disabled={!confirmPwd}
                onPress={() =>
                  Alert.alert('Are you sure?', 'This will permanently delete your account.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete forever', style: 'destructive', onPress: deleteAccount },
                  ])
                }
              />
            </Card>
          </Animated.View>
        )}
      </View>

      {/* About */}
      <View style={styles.section}>
        <SectionHeader title="About" />
        <ListRow
          icon="lock"
          iconTone="neutral"
          title="Privacy policy"
          onPress={() => Linking.openURL('https://kinora.app/privacy')}
        />
      </View>

      <Button
        title="Sign out"
        variant="ghost"
        icon="logout"
        onPress={logout}
        style={{ marginTop: space.lg }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: space.xl },
  segment: { flexDirection: 'row', gap: space.xs },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
    borderRadius: radius.md,
  },
  deleteBox: { marginTop: space.md },
  deleteHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
});
