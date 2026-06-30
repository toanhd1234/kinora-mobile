import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Icon, Input, PressableScale, Screen } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('demo@kinora.app');
  const [password, setPassword] = useState('password');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.message ?? 'Check your credentials.');
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
        <AppText variant="display" style={{ marginTop: space.xl }}>
          Kinora
        </AppText>
        <AppText variant="callout" color="textSecondary" style={{ marginTop: space.xs }}>
          Care coordination for the sandwich generation.
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(120)}>
        <Input
          label="Email"
          icon="mail"
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Password"
          icon="lock"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button
          title="Sign in"
          size="lg"
          loading={busy}
          onPress={onSubmit}
          style={{ marginTop: space.sm }}
        />

        <PressableScale onPress={() => navigation.navigate('Register')} style={styles.link}>
          <AppText variant="subhead" color="textSecondary">
            New here?{' '}
            <AppText variant="subhead" color="primary" weight="700">
              Create an account
            </AppText>
          </AppText>
        </PressableScale>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: space.xl },
  hero: { alignItems: 'center', marginBottom: space.huge },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { alignSelf: 'center', marginTop: space.xl, padding: space.sm },
});
