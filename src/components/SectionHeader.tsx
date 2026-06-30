import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { space } from '../theme/tokens';

type Props = {
  title: string;
  /** Optional trailing element, e.g. a "See all" / "Refresh" action. */
  action?: ReactNode;
};

/** Uppercase overline label that introduces a group of rows or cards. */
export default function SectionHeader({ title, action }: Props) {
  return (
    <View style={styles.row}>
      <AppText variant="overline" color="textTertiary">
        {title}
      </AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
    marginTop: space.xs,
  },
});
