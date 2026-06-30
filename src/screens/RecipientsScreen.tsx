import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AnimatedItem,
  AppText,
  Badge,
  Card,
  EmptyState,
  FAB,
  Icon,
  PressableScale,
  Screen,
  SkeletonList,
} from '../components';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { CareRecipient, TeamInvitation } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Recipients'>;

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function RecipientsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<CareRecipient[]>([]);
  const [pendingInvites, setPendingInvites] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [recipients, invites] = await Promise.all([
        api.get<CareRecipient[]>('/care-recipients'),
        api.get<TeamInvitation[]>('/invitations').catch(() => ({ data: [] as TeamInvitation[] })),
      ]);
      setItems(recipients.data);
      setPendingInvites(invites.data.length);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const header = (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <AppText variant="footnote" color="textSecondary">
          Welcome back
        </AppText>
        <AppText variant="title1">Hi {user?.name?.split(' ')[0] ?? 'there'} 👋</AppText>
      </View>
      <PressableScale
        onPress={() => navigation.navigate('Settings')}
        accessibilityLabel="Settings"
        style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Icon name="settings" size="md" color="textSecondary" />
      </PressableScale>
    </View>
  );

  const invitesBanner =
    pendingInvites > 0 ? (
      <Card
        onPress={() => navigation.navigate('Invitations')}
        style={[styles.banner, { backgroundColor: colors.primarySoft }]}
      >
        <View style={styles.bannerRow}>
          <Icon name="mail" size="md" color="onPrimarySoft" />
          <View style={{ flex: 1 }}>
            <AppText variant="subhead" weight="700" color="onPrimarySoft">
              {pendingInvites === 1
                ? '1 care team invitation'
                : `${pendingInvites} care team invitations`}
            </AppText>
            <AppText variant="footnote" color="onPrimarySoft">
              Tap to review and accept.
            </AppText>
          </View>
          <Icon name="chevron" size="sm" color="onPrimarySoft" />
        </View>
      </Card>
    ) : null;

  const listHeader = (
    <>
      {header}
      {invitesBanner}
    </>
  );

  return (
    <Screen padded={false}>
      {loading ? (
        <View style={{ padding: space.lg }}>
          {header}
          <SkeletonList count={4} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 120 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              tintColor={colors.primary}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="recipient"
              title="No one here yet"
              description="Add the parent or family member you're caring for to start tracking medications and appointments."
              actionLabel="Add family member"
              onAction={() => navigation.navigate('AddRecipient')}
            />
          }
          renderItem={({ item, index }) => (
            <AnimatedItem index={index} style={{ marginBottom: space.md }}>
              <Card
                onPress={() =>
                  navigation.navigate('RecipientHome', {
                    recipientId: item.id,
                    recipientName: item.name,
                  })
                }
              >
                <View style={styles.cardRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                    <AppText variant="title3" color="onPrimarySoft" weight="700">
                      {initials(item.name)}
                    </AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="headline">{item.name}</AppText>
                    {item.relationship ? (
                      <Badge label={item.relationship} tone="primary" style={{ marginTop: 6 }} />
                    ) : null}
                  </View>
                  <Icon name="chevron" size="sm" color="textTertiary" />
                </View>
              </Card>
            </AnimatedItem>
          )}
        />
      )}

      {!loading && items.length > 0 && (
        <FAB
          label="Add family member"
          onPress={() => navigation.navigate('AddRecipient')}
          bottomInset={insets.bottom}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  banner: { marginBottom: space.md },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
