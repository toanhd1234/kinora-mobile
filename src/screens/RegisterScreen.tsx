import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AppText, Button, Icon, Input, Screen } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) {
      Alert.alert('Please fill all fields (password ≥ 8 chars).');
      return;
    }
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e: any) {
      Alert.alert('Registration failed', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Icon name="recipient" size="xl" color="onPrimary" />
        </View>
        <AppText variant="title1" style={{ marginTop: space.lg }}>
          Create account
        </AppText>
        <AppText
          variant="callout"
          color="textSecondary"
          align="center"
          style={{ marginTop: space.xs }}
        >
          Set up your Kinora profile to start coordinating care.
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(120)}>
        <Input
          label="Name"
          icon="doctor"
          placeholder="Your name"
          autoCapitalize="words"
          autoComplete="name"
          value={name}
          onChangeText={setName}
          required
        />
        <Input
          label="Email"
          icon="mail"
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          required
        />
        <Input
          label="Password"
          icon="lock"
          placeholder="••••••••"
          hint="At least 8 characters."
          secureTextEntry
          autoComplete="password-new"
          value={password}
          onChangeText={setPassword}
          required
        />

        <Button
          title="Create account"
          size="lg"
          loading={busy}
          onPress={onSubmit}
          style={{ marginTop: space.sm }}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: space.xl },
  hero: { alignItems: 'center', marginBottom: space.xxxl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
