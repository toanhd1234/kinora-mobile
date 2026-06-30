import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ReduceMotion } from 'react-native-reanimated';
import {
  initConnection,
  endConnection,
  getSubscriptions,
  getAvailablePurchases,
  requestSubscription,
  finishTransaction,
  type Subscription,
  type SubscriptionPurchase,
} from 'react-native-iap';
import { AppText, Button, Card, Icon, Loading, Screen } from '../components';
import type { IconName } from '../components';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { SubscriptionStatus } from '../types';

const PRODUCT_ID = 'app.kinora.premium.monthly';
const TERMS_URL = 'https://kinora.app/terms';
const PRIVACY_URL = 'https://kinora.app/privacy';

const BENEFITS: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'team', title: 'Unlimited family sharing', desc: 'Across every care recipient you manage.' },
  { icon: 'explain', title: 'Unlimited AI explanations', desc: 'Of prescriptions, lab results & letters.' },
  { icon: 'appointments', title: 'AI appointment summaries', desc: 'Record visits and get a clear write-up.' },
  { icon: 'documents', title: 'Full document vault', desc: 'Store everything and export anytime.' },
  { icon: 'interactions', title: 'Drug-interaction checks', desc: 'Against the FDA label database.' },
];

/** localizedPrice only exists on the iOS subscription shape; read it safely. */
function priceLabel(product: Subscription | null): string {
  const localized = (product as { localizedPrice?: string } | null)?.localizedPrice;
  return localized ?? '€9.99';
}

export default function PaywallScreen() {
  const { colors } = useTheme();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [product, setProduct] = useState<Subscription | null>(null);
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get<SubscriptionStatus>('/subscription/status');
        if (mounted) setStatus(data);

        await initConnection();
        const subs = await getSubscriptions({ skus: [PRODUCT_ID] });
        if (mounted && subs[0]) setProduct(subs[0]);
      } catch {
        // store not available (e.g. running in Expo Go) — show fallback
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      endConnection().catch(() => {});
    };
  }, []);

  const buy = async () => {
    setBusy(true);
    try {
      // Google Play subscriptions require the offer token; iOS uses the sku alone.
      const offerToken =
        Platform.OS === 'android'
          ? (product as { subscriptionOfferDetails?: { offerToken: string }[] } | null)
              ?.subscriptionOfferDetails?.[0]?.offerToken
          : undefined;

      if (Platform.OS === 'android' && !offerToken) {
        throw new Error('Subscription offer unavailable. Please try again later.');
      }

      const purchase = (await requestSubscription({
        sku: PRODUCT_ID,
        ...(offerToken ? { subscriptionOffers: [{ sku: PRODUCT_ID, offerToken }] } : {}),
      })) as SubscriptionPurchase | SubscriptionPurchase[] | null;
      const p = Array.isArray(purchase) ? purchase[0] : purchase;
      if (!p) throw new Error('Purchase cancelled.');

      const receipt = Platform.OS === 'ios' ? p.transactionReceipt : p.purchaseToken;
      if (!receipt) throw new Error('Missing receipt.');

      const { data } = await api.post<{ is_premium: boolean }>('/subscription/verify', {
        platform: Platform.OS,
        receipt,
        product_id: PRODUCT_ID,
      });
      await finishTransaction({ purchase: p, isConsumable: false });
      setStatus((s) => (s ? { ...s, is_premium: data.is_premium } : s));
      await refreshUser(); // sync global user.is_premium so the rest of the app unlocks
      Alert.alert('Welcome to Premium ✨', 'Thanks for supporting Kinora.');
    } catch (e: any) {
      // User dismissed the native sheet — not an error worth surfacing.
      if (e?.code === 'E_USER_CANCELLED') return;
      Alert.alert('Purchase failed', e?.response?.data?.message ?? e.message ?? 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setRestoring(true);
    try {
      const purchases = await getAvailablePurchases();
      const p = purchases.find((x) => x.productId === PRODUCT_ID) ?? purchases[0];
      const receipt = p ? (Platform.OS === 'ios' ? p.transactionReceipt : p.purchaseToken) : null;
      if (!receipt) {
        Alert.alert(
          'Nothing to restore',
          'We couldn’t find a previous Kinora Premium purchase on this account.',
        );
        return;
      }

      const { data } = await api.post<{ is_premium: boolean }>('/subscription/verify', {
        platform: Platform.OS,
        receipt,
        product_id: PRODUCT_ID,
      });
      setStatus((s) => (s ? { ...s, is_premium: data.is_premium } : s));
      await refreshUser(); // sync global user.is_premium so the rest of the app unlocks

      if (data.is_premium) {
        Alert.alert('Purchases restored ✨', 'Your Premium subscription is active again.');
      } else {
        Alert.alert(
          'No active subscription',
          'We found a past purchase, but it’s no longer active.',
        );
      }
    } catch (e: any) {
      Alert.alert('Restore failed', e?.response?.data?.message ?? e.message ?? 'Try again.');
    } finally {
      setRestoring(false);
    }
  };

  if (loading) return <Loading label="Loading subscription…" />;

  if (status?.is_premium) {
    return (
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}>
          <Card tone="alt" style={[styles.activeCard, { borderColor: colors.primary }]}>
            <View style={[styles.activeIcon, { backgroundColor: colors.primary }]}>
              <Icon name="premium" size="lg" color="onPrimary" />
            </View>
            <AppText variant="title2" align="center" style={{ marginTop: space.lg }}>
              You're a Premium member
            </AppText>
            <AppText
              variant="callout"
              color="textSecondary"
              align="center"
              style={{ marginTop: space.sm }}
            >
              Thank you. Renewal & cancellation are managed in your{' '}
              {Platform.OS === 'ios' ? 'Apple ID subscriptions' : 'Google Play subscriptions'}.
            </AppText>
          </Card>
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {/* Hero */}
      <Animated.View entering={FadeIn.duration(360).reduceMotion(ReduceMotion.System)} style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
          <Icon name="premium" size="xl" color="onPrimary" />
        </View>
        <AppText variant="title1" align="center" style={{ marginTop: space.lg }}>
          Kinora Premium
        </AppText>
        <AppText variant="callout" color="textSecondary" align="center" style={{ marginTop: space.xs }}>
          Care for your parents without the overload.
        </AppText>
      </Animated.View>

      {/* Benefits */}
      <Card style={styles.benefitsCard}>
        {BENEFITS.map((b, i) => (
          <Animated.View
            key={b.title}
            entering={FadeInDown.duration(260).delay(i * 60).reduceMotion(ReduceMotion.System)}
            style={[
              styles.benefit,
              i > 0 && { borderTopWidth: 1, borderTopColor: colors.hairline },
            ]}
          >
            <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name={b.icon} size="sm" color="onPrimarySoft" />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="subhead" weight="600">
                {b.title}
              </AppText>
              <AppText variant="footnote" color="textSecondary" style={{ marginTop: 2 }}>
                {b.desc}
              </AppText>
            </View>
            <Icon name="check" size="sm" color="success" />
          </Animated.View>
        ))}
      </Card>

      {/* Price */}
      <View style={styles.priceBox}>
        <View style={styles.priceRow}>
          <AppText variant="display">{priceLabel(product)}</AppText>
          <AppText variant="headline" color="textSecondary">
            {' '}
            / month
          </AppText>
        </View>
        <AppText variant="footnote" color="textTertiary">
          or €79 / year on the web
        </AppText>
      </View>

      <Button
        title={busy ? 'Processing…' : product ? 'Start Premium' : 'Store unavailable'}
        size="lg"
        icon="premium"
        loading={busy}
        disabled={!product}
        onPress={buy}
      />

      {/* Apple requires a Restore action on any auto-renewable subscription screen. */}
      <Button
        title="Restore purchases"
        variant="ghost"
        size="md"
        loading={restoring}
        disabled={busy}
        onPress={restore}
        style={styles.restore}
      />

      <AppText variant="caption" color="textTertiary" align="center" style={styles.legal}>
        Subscriptions auto-renew until cancelled in your store settings. Payment is charged to your
        Apple ID / Google account. Cancel at any time at least 24h before the renewal date.
      </AppText>

      {/* Required by the App Store: tappable Terms & Privacy on the purchase screen. */}
      <View style={styles.links}>
        <AppText
          variant="caption"
          color="primary"
          accessibilityRole="link"
          onPress={() => Linking.openURL(TERMS_URL)}
        >
          Terms of Service
        </AppText>
        <AppText variant="caption" color="textTertiary">
          {'   ·   '}
        </AppText>
        <AppText
          variant="caption"
          color="primary"
          accessibilityRole="link"
          onPress={() => Linking.openURL(PRIVACY_URL)}
        >
          Privacy Policy
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: space.xl },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsCard: { gap: 0 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBox: { alignItems: 'center', marginVertical: space.xl },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  restore: { marginTop: space.sm },
  legal: { marginTop: space.lg, lineHeight: 17 },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: space.sm,
  },
  activeCard: { alignItems: 'center', borderWidth: 1.5, marginTop: space.lg },
  activeIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
