import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AnimatedItem,
  AppText,
  Button,
  Card,
  EmptyState,
  Icon,
  PressableScale,
  Screen,
  SkeletonList,
} from '../components';
import { api } from '../api/client';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { TeamInvitation } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Invitations'>;

export default function InvitationsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [items, setItems] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<TeamInvitation[]>('/invitations');
      setItems(data);
    } catch (e: any) {
      Alert.alert('Could not load invitations', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const respond = async (id: number, action: 'accept' | 'decline') => {
    setBusyId(id);
    try {
      await api.post(`/invitations/${id}/${action}`);
      setItems((list) => list.filter((i) => i.id !== id));
      if (action === 'accept') {
        Alert.alert('Invitation accepted', 'You now have access to this care recipient.');
      }
    } catch (e: any) {
      Alert.alert('Something went wrong', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <Screen>
        <SkeletonList count={3} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="mail"
            title="No pending invitations"
            description="When a family member invites you to help care for someone, it'll show up here for you to accept."
          />
        }
        renderItem={({ item, index }) => {
          const recipientName = item.care_recipient?.name ?? 'A care recipient';
          const inviter = item.care_recipient?.user?.name;
          const busy = busyId === item.id;
          return (
            <AnimatedItem index={index}>
              <Card elevation={1} style={styles.card}>
                <View style={styles.titleRow}>
                  <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
                    <Icon name="team" size="sm" color="onPrimarySoft" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="headline" numberOfLines={1}>
                      {recipientName}
                    </AppText>
                    <AppText variant="footnote" color="textSecondary" style={styles.sub}>
                      {inviter ? `Invited by ${inviter}` : 'Care team invitation'}
                    </AppText>
                  </View>
                </View>
                <View style={styles.actions}>
                  <PressableScale
                    onPress={() => respond(item.id, 'decline')}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityLabel="Decline invitation"
                    style={[styles.declineBtn, { borderColor: colors.border }]}
                  >
                    <AppText variant="subhead" weight="600" color="textSecondary">
                      Decline
                    </AppText>
                  </PressableScale>
                  <Button
                    title="Accept"
                    icon="check"
                    loading={busy}
                    onPress={() => respond(item.id, 'accept')}
                    style={styles.acceptBtn}
                  />
                </View>
              </Card>
            </AnimatedItem>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: space.lg, paddingBottom: space.huge },
  card: { marginBottom: space.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: { marginTop: 2 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.lg,
  },
  declineBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: { flex: 1 },
});
