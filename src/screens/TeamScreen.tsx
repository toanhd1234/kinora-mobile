import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AnimatedItem,
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  PressableScale,
  Screen,
  SectionHeader,
  SkeletonList,
} from '../components';
import { api } from '../api/client';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { CareTeamMember } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Team'>;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TeamScreen({ route }: Props) {
  const { recipientId } = route.params;
  const { colors } = useTheme();
  const [members, setMembers] = useState<CareTeamMember[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<CareTeamMember[]>(
        `/care-recipients/${recipientId}/members`,
      );
      setMembers(data);
    } catch (e: any) {
      Alert.alert('Could not load team', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setLoading(false);
    }
  }, [recipientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const invite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    try {
      await api.post(`/care-recipients/${recipientId}/invitations`, { email: email.trim() });
      setEmail('');
      await load();
    } catch (e: any) {
      Alert.alert('Could not invite', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setInviting(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/care-recipients/${recipientId}/members/${id}`);
      await load();
    } catch (e: any) {
      Alert.alert('Could not remove', e?.response?.data?.message ?? 'Try again.');
    }
  };

  const header = (
    <View style={styles.headerWrap}>
      <Card elevation={1} style={styles.inviteCard}>
        <View style={styles.inviteTitleRow}>
          <Icon name="mail" size="sm" color="onPrimarySoft" />
          <AppText variant="headline">Invite a sibling or relative</AppText>
        </View>
        <AppText variant="footnote" color="textSecondary" style={styles.inviteHint}>
          They'll need to accept the invitation in their Kinora app before they can see this person.
        </AppText>
        <Input
          label="Email address"
          icon="mail"
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          containerStyle={styles.inviteInput}
        />
        <Button
          title="Send invitation"
          icon="add"
          loading={inviting}
          onPress={invite}
          fullWidth
        />
      </Card>
      <SectionHeader title="Care team" />
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <SkeletonList count={5} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={members}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="team"
            title="No team members yet"
            description="Invite a family member above to share care for this recipient."
          />
        }
        renderItem={({ item, index }) => {
          const name = item.user?.name ?? item.invited_email ?? 'Pending';
          const isOwner = item.role === 'owner';
          const subLine = item.user?.email ?? item.invited_email ?? 'Invitation pending';
          return (
            <AnimatedItem index={index}>
              <Card elevation={1} style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                  <AppText variant="subhead" color="onPrimarySoft" weight="700">
                    {initials(name)}
                  </AppText>
                </View>
                <View style={styles.rowBody}>
                  <AppText variant="headline" numberOfLines={1}>
                    {name}
                  </AppText>
                  <AppText
                    variant="footnote"
                    color="textSecondary"
                    numberOfLines={1}
                    style={styles.rowSub}
                  >
                    {subLine}
                  </AppText>
                  <View style={styles.badgeRow}>
                    <Badge
                      tone={isOwner ? 'primary' : 'neutral'}
                      label={isOwner ? 'Owner' : 'Member'}
                    />
                    {!item.accepted_at && <Badge tone="warning" label="Pending" />}
                  </View>
                </View>
                {!isOwner && (
                  <PressableScale
                    onPress={() => remove(item.id)}
                    style={[styles.removeBtn, { backgroundColor: colors.dangerSoft }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${name}`}
                  >
                    <Icon name="trash" size="sm" color="onDangerSoft" />
                  </PressableScale>
                )}
              </Card>
            </AnimatedItem>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { marginBottom: space.sm },
  inviteCard: { marginBottom: space.xl },
  inviteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.xs,
  },
  inviteHint: { marginBottom: space.lg },
  inviteInput: { marginBottom: space.md },
  listContent: { padding: space.lg, paddingBottom: space.huge },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowSub: { marginTop: 2 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.sm,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
