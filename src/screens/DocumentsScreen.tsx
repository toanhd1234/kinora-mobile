import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Document } from '../types';
import {
  Screen,
  AppText,
  Button,
  Card,
  Input,
  Badge,
  Chip,
  Icon,
  EmptyState,
  SectionHeader,
  AnimatedItem,
  PressableScale,
  Loading,
} from '../components';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Documents'>;

const TYPES = ['prescription', 'lab', 'insurance', 'letter', 'other'] as const;

export default function DocumentsScreen({ route }: Props) {
  const { recipientId } = route.params;
  const { colors } = useTheme();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<(typeof TYPES)[number]>('other');
  const [picked, setPicked] = useState<{ uri: string; name: string; mime: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Document[]>(`/care-recipients/${recipientId}/documents`);
      setDocs(data);
    } finally {
      setLoading(false);
    }
  }, [recipientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (res.canceled || !res.assets[0]) return;
    const a = res.assets[0];
    setPicked({ uri: a.uri, name: a.name, mime: a.mimeType ?? 'application/octet-stream' });
    if (!title.trim()) setTitle(a.name.replace(/\.[^.]+$/, ''));
  };

  const upload = async () => {
    if (!picked) {
      Alert.alert('Please pick a file first.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Please give the document a title.');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', { uri: picked.uri, name: picked.name, type: picked.mime } as any);
      form.append('title', title.trim());
      form.append('type', type);
      await api.post(`/care-recipients/${recipientId}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle(''); setPicked(null); setType('other');
      await load();
    } catch (e: any) {
      Alert.alert('Could not upload', e?.response?.data?.message ?? 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/documents/${id}`);
      await load();
    } catch (e: any) {
      Alert.alert('Could not delete', e?.response?.data?.message ?? 'Try again.');
    }
  };

  const confirmRemove = (item: Document) => {
    Alert.alert('Delete document', `Remove “${item.title}”? This can’t be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) },
    ]);
  };

  if (loading) return <Loading label="Loading documents…" />;

  return (
    <Screen padded={false}>
      <FlatList
        data={docs}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Card style={styles.uploadCard}>
              <AppText variant="title3">Upload a document</AppText>
              <AppText variant="footnote" color="textSecondary" style={styles.uploadHint}>
                Keep prescriptions, lab results and letters in one secure vault.
              </AppText>

              <PressableScale onPress={pickFile} style={styles.dropzoneWrap}>
                <View
                  style={[
                    styles.dropzone,
                    {
                      borderColor: picked ? colors.primary : colors.border,
                      backgroundColor: picked ? colors.primarySoft : colors.surfaceAlt,
                    },
                  ]}
                >
                  <Icon name="attach" size="md" color={picked ? 'onPrimarySoft' : 'textSecondary'} />
                  <AppText
                    variant="subhead"
                    color={picked ? 'onPrimarySoft' : 'textSecondary'}
                    weight="600"
                    numberOfLines={1}
                    style={styles.dropzoneText}
                  >
                    {picked ? picked.name : 'Pick a file (PDF, image…)'}
                  </AppText>
                </View>
              </PressableScale>

              <Input
                label="Title"
                placeholder="e.g. Blood test results"
                value={title}
                onChangeText={setTitle}
                containerStyle={styles.titleInput}
              />

              <AppText variant="subhead" color="textSecondary" style={styles.typeLabel}>
                Type
              </AppText>
              <View style={styles.chips}>
                {TYPES.map((t) => (
                  <Chip key={t} label={t} selected={type === t} onPress={() => setType(t)} />
                ))}
              </View>

              <Button
                title={busy ? 'Uploading…' : 'Upload'}
                onPress={upload}
                icon="upload"
                loading={busy}
                fullWidth
              />
            </Card>

            <SectionHeader title="Vault" />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="documents"
            title="No documents yet"
            description="Upload a prescription, lab result or letter to start building the vault."
          />
        }
        renderItem={({ item, index }) => (
          <AnimatedItem index={index}>
            <Card style={styles.docCard}>
              <View style={styles.docRow}>
                <View style={[styles.iconChip, { backgroundColor: colors.primarySoft }]}>
                  <Icon name="documents" size="sm" color="onPrimarySoft" />
                </View>
                <View style={styles.docBody}>
                  <AppText variant="headline" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText
                    variant="footnote"
                    color="textTertiary"
                    numberOfLines={1}
                    style={styles.docMeta}
                  >
                    {item.type ?? 'other'}
                    {item.mime ? ` · ${item.mime}` : ''}
                    {item.size ? ` · ${Math.round(item.size / 1024)} KB` : ''}
                  </AppText>
                  <Badge label={item.type ?? 'other'} tone="neutral" style={styles.docBadge} />
                </View>
                <PressableScale
                  onPress={() => confirmRemove(item)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete document"
                  style={styles.deleteBtn}
                >
                  <Icon name="trash" size="sm" color="danger" />
                </PressableScale>
              </View>
            </Card>
          </AnimatedItem>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.huge },
  uploadCard: { marginBottom: space.xl },
  uploadHint: { marginTop: space.xs, marginBottom: space.lg },
  dropzoneWrap: { marginBottom: space.lg },
  dropzone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
  },
  dropzoneText: { flex: 1 },
  titleInput: { marginBottom: space.md },
  typeLabel: { marginBottom: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.xl },
  docCard: { marginBottom: space.md },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docBody: { flex: 1 },
  docMeta: { marginTop: 2 },
  docBadge: { marginTop: space.sm },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
