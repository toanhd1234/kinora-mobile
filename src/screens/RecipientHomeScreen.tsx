import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, ListRow, Screen } from '../components';
import type { IconName } from '../components';
import { space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipientHome'>;

type Tile = {
  key: keyof RootStackParamList;
  label: string;
  desc: string;
  icon: IconName;
  tone: 'primary' | 'accent' | 'neutral';
};

const TILES: Tile[] = [
  { key: 'Medications', label: 'Medications', desc: 'Track doses & reminders', icon: 'meds', tone: 'primary' },
  { key: 'Interactions', label: 'Interaction check', desc: 'Cross-check meds against FDA labels', icon: 'interactions', tone: 'primary' },
  { key: 'Explain', label: 'Explain for me', desc: 'Snap a prescription, get plain language', icon: 'explain', tone: 'accent' },
  { key: 'Appointments', label: 'Appointments', desc: 'Prep questions & record summaries', icon: 'appointments', tone: 'primary' },
  { key: 'Documents', label: 'Documents', desc: 'Central medical file vault', icon: 'documents', tone: 'neutral' },
  { key: 'Team', label: 'Care team', desc: 'Share access with family', icon: 'team', tone: 'accent' },
];

export default function RecipientHomeScreen({ route, navigation }: Props) {
  const { recipientId, recipientName } = route.params;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText variant="title1">{recipientName}</AppText>
        <AppText variant="callout" color="textSecondary" style={{ marginTop: space.xs }}>
          What would you like to do?
        </AppText>
      </View>

      <View style={{ gap: space.md }}>
        {TILES.map((t, i) => (
          <Animated.View key={t.key} entering={FadeInDown.duration(260).delay(i * 50)}>
            <ListRow
              title={t.label}
              subtitle={t.desc}
              icon={t.icon}
              iconTone={t.tone}
              onPress={() => navigation.navigate(t.key as any, { recipientId, recipientName })}
            />
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: space.xl },
});
