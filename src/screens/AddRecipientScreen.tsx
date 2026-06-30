import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { AppText, Button, Icon, Input, Screen } from '../components';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AddRecipient'>;

export default function AddRecipientScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Name is required.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/care-recipients', {
        name: name.trim(),
        relationship: relationship.trim() || null,
        notes: notes.trim() || null,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Could not save', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(320)} style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: colors.primarySoft }]}>
          <Icon name="recipient" size="lg" color="primary" />
        </View>
        <AppText variant="title1">Who are you caring for?</AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          Add a loved one so you can track their care, appointments, and medications in one place.
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(320).delay(80)}>
        <Input
          label="Name"
          required
          icon="recipient"
          placeholder="e.g. Mama"
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="next"
        />

        <Input
          label="Relationship"
          icon="team"
          placeholder="Mother, father, partner…"
          value={relationship}
          onChangeText={setRelationship}
        />

        <Input
          label="Notes"
          icon="info"
          hint="Conditions, allergies, anything the care team should know."
          placeholder="Add any helpful details…"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(320).delay(160)}>
        <Button
          title="Save"
          onPress={onSubmit}
          variant="primary"
          size="lg"
          loading={busy}
          fullWidth
          icon="check"
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: space.huge,
  },
  header: {
    marginBottom: space.xl,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  subtitle: {
    marginTop: space.xs,
  },
});
