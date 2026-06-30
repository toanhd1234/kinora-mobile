import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Card, Icon, Input, PressableScale, Screen } from '../components';
import { api } from '../api/client';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Explanation } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Explain'>;

export default function ExplainScreen({ route }: Props) {
  const { recipientId } = route.params;
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Explanation | null>(null);

  const pick = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please grant access to continue.');
      return;
    }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.75, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.75, allowsEditing: true });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      setImageUri(a.uri);
      setImageMime(a.mimeType || 'image/jpeg');
      setResult(null);
    }
  };

  const submit = async () => {
    if (!imageUri) {
      Alert.alert('Please choose or take a photo first.');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('image', { uri: imageUri, name: 'doc.jpg', type: imageMime } as any);
      if (prompt.trim()) form.append('prompt', prompt.trim());
      form.append('language', 'en');

      const { data } = await api.post<Explanation>(
        `/care-recipients/${recipientId}/explanations`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setResult(data);
    } catch (e: any) {
      Alert.alert('Could not analyse', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      {/* Intro */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.intro}>
        <View style={[styles.heroIcon, { backgroundColor: colors.accentSoft }]}>
          <Icon name="explain" size="md" color="onAccentSoft" />
        </View>
        <AppText variant="title3" style={{ marginTop: space.md }}>
          Explain for me
        </AppText>
        <AppText variant="footnote" color="textSecondary" style={{ marginTop: space.xs }}>
          Snap a prescription, lab result or hospital letter and Kinora will explain it in plain
          language. Always confirm important details with the treating doctor.
        </AppText>
      </Animated.View>

      {/* Image preview / dropzone */}
      {imageUri ? (
        <Animated.View entering={FadeIn.duration(300)}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
        </Animated.View>
      ) : (
        <View style={[styles.dropzone, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
          <Icon name="image" size="xl" color="textTertiary" />
          <AppText variant="footnote" color="textTertiary" style={{ marginTop: space.sm }}>
            No image selected
          </AppText>
        </View>
      )}

      {/* Source buttons */}
      <View style={styles.row}>
        <Button
          title="Camera"
          variant="secondary"
          icon="camera"
          onPress={() => pick(true)}
          style={{ flex: 1 }}
        />
        <Button
          title="Library"
          variant="secondary"
          icon="image"
          onPress={() => pick(false)}
          style={{ flex: 1 }}
        />
      </View>

      <Input
        label="Anything specific worrying you? (optional)"
        placeholder="e.g. Why is the dose higher than last time?"
        multiline
        value={prompt}
        onChangeText={setPrompt}
      />

      <Button
        title={busy ? 'Analysing…' : 'Explain this for me'}
        size="lg"
        icon="explain"
        loading={busy}
        disabled={!imageUri}
        onPress={submit}
      />

      {result && (
        <Animated.View entering={FadeInDown.duration(320)}>
          <Card style={styles.result}>
            <View style={styles.resultHead}>
              <Icon name="explain" size="sm" color="primary" />
              <AppText variant="headline">Plain-language explanation</AppText>
            </View>
            <AppText variant="body" style={{ marginTop: space.md }}>
              {result.response}
            </AppText>
            <View style={[styles.disclaimer, { borderTopColor: colors.hairline }]}>
              <Icon name="warning" size="xs" color="accent" />
              <AppText variant="caption" color="onAccentSoft" style={{ flex: 1 }}>
                Kinora is not a doctor. Confirm anything important with the treating physician.
              </AppText>
            </View>
          </Card>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: space.lg },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: '100%',
    height: 240,
    borderRadius: radius.lg,
    marginBottom: space.md,
  },
  dropzone: {
    height: 160,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  row: { flexDirection: 'row', gap: space.md, marginBottom: space.lg },
  result: { marginTop: space.xl },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  disclaimer: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'flex-start',
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
});
