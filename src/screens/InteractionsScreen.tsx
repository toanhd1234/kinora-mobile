import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Badge, Card, Icon, Loading, Screen } from '../components';
import { api } from '../api/client';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';

type CrossMatch = { other: string; snippet: string };
type DrugReport = {
  drug: string;
  has_label_data: boolean;
  label_interactions: string | null;
  cross_matches: CrossMatch[];
};
type Response = {
  medications: string[];
  report: DrugReport[];
  disclaimer: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Interactions'>;

export default function InteractionsScreen({ route }: Props) {
  const { recipientId } = route.params;
  const { colors } = useTheme();
  const [resp, setResp] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post<Response>(
          `/care-recipients/${recipientId}/interaction-check`,
        );
        setResp(data);
      } catch (e: any) {
        Alert.alert('Could not check', e?.response?.data?.message ?? 'Try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [recipientId]);

  if (loading) return <Loading label="Cross-checking FDA labels…" />;
  if (!resp) return null;

  const flagged = resp.report.filter((r) => r.cross_matches.length > 0);
  const noData = resp.report.filter((r) => !r.has_label_data);
  const allClear = flagged.length === 0;

  return (
    <Screen scroll>
      {/* Summary banner */}
      <Animated.View entering={FadeInDown.duration(300)}>
        <Card
          tone="alt"
          style={[
            styles.summary,
            { borderColor: allClear ? colors.success : colors.warning },
          ]}
        >
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: allClear ? colors.successSoft : colors.warningSoft },
            ]}
          >
            <Icon
              name={allClear ? 'checkCircle' : 'warning'}
              size="lg"
              color={allClear ? 'success' : 'warning'}
            />
          </View>
          <AppText variant="title3" style={{ marginTop: space.md }}>
            {allClear ? 'No documented interactions' : `${flagged.length} item${flagged.length === 1 ? '' : 's'} to review`}
          </AppText>
          <AppText variant="footnote" color="textSecondary" style={{ marginTop: space.xs }}>
            Checked {resp.medications.length} active medication
            {resp.medications.length === 1 ? '' : 's'}.
          </AppText>
          <View style={styles.pills}>
            {resp.medications.map((m) => (
              <Badge key={m} label={m} tone="neutral" icon="pill" />
            ))}
          </View>
        </Card>
      </Animated.View>

      {allClear && (
        <Animated.View entering={FadeInDown.duration(300).delay(80)}>
          <Card style={styles.block}>
            <AppText variant="callout" color="textSecondary">
              None of the FDA labels mention the other medications in this list. This is not a
              guarantee of safety — always confirm with a pharmacist.
            </AppText>
          </Card>
        </Animated.View>
      )}

      {flagged.map((r, idx) => (
        <Animated.View key={r.drug} entering={FadeInDown.duration(300).delay(80 + idx * 60)}>
          <Card style={[styles.block, styles.alertCard, { borderColor: colors.warning }]}>
            <View style={styles.alertHead}>
              <Icon name="warning" size="sm" color="warning" />
              <AppText variant="headline" color="onWarningSoft">
                {r.drug}
              </AppText>
            </View>
            {r.cross_matches.map((m, i) => (
              <View key={i} style={styles.match}>
                <AppText variant="subhead" weight="600">
                  Mentions {m.other}
                </AppText>
                <AppText
                  variant="footnote"
                  color="textSecondary"
                  style={[styles.snippet, { borderLeftColor: colors.warning }]}
                >
                  “{m.snippet}”
                </AppText>
              </View>
            ))}
          </Card>
        </Animated.View>
      ))}

      {noData.length > 0 && (
        <Card style={styles.block}>
          <View style={styles.alertHead}>
            <Icon name="info" size="sm" color="info" />
            <AppText variant="subhead" weight="600">
              No FDA label found
            </AppText>
          </View>
          <AppText variant="footnote" color="textSecondary" style={{ marginTop: space.sm }}>
            {noData.map((r) => r.drug).join(', ')} — these may be EU-only brand names. Ask the
            pharmacist for the equivalent generic to re-check.
          </AppText>
        </Card>
      )}

      <View style={styles.disclaimer}>
        <Icon name="info" size="xs" color="textTertiary" />
        <AppText variant="caption" color="textTertiary" style={{ flex: 1 }}>
          {resp.disclaimer}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: 'flex-start' },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.md },
  block: { marginTop: space.md },
  alertCard: { borderWidth: 1.5 },
  alertHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  match: { marginTop: space.md },
  snippet: {
    marginTop: space.xs,
    paddingLeft: space.md,
    borderLeftWidth: 2,
    fontStyle: 'italic',
  },
  disclaimer: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.xl,
    paddingHorizontal: space.xs,
  },
});
