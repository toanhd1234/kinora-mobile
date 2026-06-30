import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AnimatedItem,
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  FAB,
  Icon,
  Screen,
  SkeletonList,
} from '../components';
import { api } from '../api/client';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Medication } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Medications'>;

export default function MedicationsScreen({ route, navigation }: Props) {
  const { recipientId, recipientName } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Medication[]>(
        `/care-recipients/${recipientId}/medications`,
      );
      setItems(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [recipientId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const markTaken = async (med: Medication) => {
    try {
      await api.post(`/medications/${med.id}/logs`, { status: 'taken' });
      Alert.alert('Logged ✓', `${med.name} marked as taken.`);
    } catch (e: any) {
      Alert.alert('Could not log', e?.response?.data?.message ?? 'Try again.');
    }
  };

  const header = (
    <View style={styles.header}>
      <AppText variant="footnote" color="textSecondary">
        Medications
      </AppText>
      <AppText variant="title1">{recipientName}</AppText>
    </View>
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
          ListHeaderComponent={header}
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
              icon="meds"
              title="No medications yet"
              description="Add the first medication to start tracking doses and daily routines."
              actionLabel="Add medication"
              onAction={() =>
                navigation.navigate('AddMedication', { recipientId, recipientName })
              }
            />
          }
          renderItem={({ item, index }) => (
            <AnimatedItem index={index} style={{ marginBottom: space.md }}>
              <Card>
                <View style={styles.cardHeader}>
                  <View style={[styles.medIcon, { backgroundColor: colors.primarySoft }]}>
                    <Icon name="pill" size="md" color="onPrimarySoft" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="headline">{item.name}</AppText>
                    {item.dosage ? (
                      <Badge label={item.dosage} tone="primary" style={{ marginTop: 6 }} />
                    ) : null}
                  </View>
                </View>

                {item.times_of_day && item.times_of_day.length > 0 ? (
                  <View style={styles.timesRow}>
                    <Icon name="clock" size="xs" color="textSecondary" />
                    <AppText variant="subhead" color="textSecondary">
                      {item.times_of_day.join(', ')}
                    </AppText>
                  </View>
                ) : null}

                {item.instructions ? (
                  <AppText
                    variant="footnote"
                    color="textTertiary"
                    style={styles.instructions}
                  >
                    {item.instructions}
                  </AppText>
                ) : null}

                <View style={styles.actionRow}>
                  <Button
                    title="Mark taken"
                    variant="tinted"
                    size="sm"
                    icon="check"
                    fullWidth={false}
                    onPress={() => markTaken(item)}
                  />
                </View>
              </Card>
            </AnimatedItem>
          )}
        />
      )}

      {!loading && items.length > 0 && (
        <FAB
          label="Add medication"
          onPress={() =>
            navigation.navigate('AddMedication', { recipientId, recipientName })
          }
          bottomInset={insets.bottom}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: space.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  medIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
  },
  instructions: {
    marginTop: space.sm,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: space.md,
  },
});
