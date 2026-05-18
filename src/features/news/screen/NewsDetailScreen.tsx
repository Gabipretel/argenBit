import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import dayjs from "dayjs";
import { useLayoutEffect, useMemo } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import type { NewsStackParamList } from "@/core/navigation/types";
import { findNewsArticleById } from "@/ws/newsArticleCache";
import { cardShadow, colors, radii, spacing, toolbarPanelShadow, typography } from "@/core/theme";
import {
  newsPillForArticle,
  newsReadingMinutesFromHtml,
  newsRelativeShort,
  sourceInitials,
} from "@/common";

type Props = NativeStackScreenProps<NewsStackParamList, "NewsDetail">;

const MAX_PREVIEW_PARAGRAPHS = 5;
const MAX_PREVIEW_CHARS = 1_700;

/** Respeta saltos de párrafo del HTML. Si queda un solo bloque, parte en bloques de lectura. */
function paragraphsFromHtml(html: string): string[] {
  const loosened = html
    .replace(/<\/p\s*>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/div\s*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/h[1-6]\s*>/gi, "\n");
  const stripped = loosened.replace(/<[^>]*>/g, " ");
  const blocks = stripped
    .split(/\n+/)
    .map((b) => b.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;
  const single = blocks[0] ?? "";
  if (!single) return [];
  return splitReadingBlocks(single, 180);
}

function splitReadingBlocks(text: string, maxLen: number): string[] {
  const sentences = text.match(/[^.!?…]+(?:[.!?…]+|$)/g) ?? [text];
  const out: string[] = [];
  let buf = "";
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    const next = buf ? `${buf} ${s}` : s;
    if (next.length <= maxLen) buf = next;
    else {
      if (buf) out.push(buf);
      buf = s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
    }
  }
  if (buf) out.push(buf);
  return out;
}

function normalizeBodySource(paragraphs: string[]): string {
  return paragraphs
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function takePreviewParagraphs(paragraphs: string[], maxParas: number, maxChars: number): string[] {
  const out: string[] = [];
  let chars = 0;
  for (const p of paragraphs) {
    if (!p.trim()) continue;
    if (out.length >= maxParas) break;
    const add = p.length + (out.length ? 2 : 0);
    if (chars + add > maxChars && out.length > 0) break;
    out.push(p);
    chars += add;
  }
  return out;
}

function hostLabel(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    return h || "el sitio";
  } catch {
    return "el sitio";
  }
}

export function NewsDetailScreen({ route }: Props) {
  const { articleId } = route.params;
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const article = useMemo(
    () => findNewsArticleById(queryClient, articleId),
    [queryClient, articleId]
  );

  const bodyParagraphs = useMemo(
    () => (article ? paragraphsFromHtml(article.body) : []),
    [article]
  );

  const bodySource = useMemo(() => normalizeBodySource(bodyParagraphs), [bodyParagraphs]);

  const previewParagraphs = useMemo(
    () => takePreviewParagraphs(bodyParagraphs, MAX_PREVIEW_PARAGRAPHS, MAX_PREVIEW_CHARS),
    [bodyParagraphs]
  );

  const previewTextLen = useMemo(
    () => previewParagraphs.join("\n\n").length,
    [previewParagraphs]
  );

  const hasMoreContent = useMemo(() => {
    if (!bodyParagraphs.length) return false;
    if (bodyParagraphs.length > previewParagraphs.length) return true;
    return bodySource.length > previewTextLen + 40;
  }, [bodyParagraphs.length, previewParagraphs.length, bodySource.length, previewTextLen]);

  const whenFull = useMemo(
    () => (article ? dayjs.unix(article.publishedOn).format("D [de] MMMM, YYYY") : ""),
    [article]
  );
  const whenRel = useMemo(
    () => (article ? newsRelativeShort(article.publishedOn) : ""),
    [article]
  );
  const pill = useMemo(
    () => (article ? newsPillForArticle(article.id) : newsPillForArticle("")),
    [article]
  );
  const initials = useMemo(
    () => (article ? sourceInitials(article.source) : "?"),
    [article]
  );
  const readMin = useMemo(
    () => (article ? newsReadingMinutesFromHtml(article.body) : 1),
    [article]
  );

  useLayoutEffect(() => {
    if (!article) {
      navigation.setOptions({ title: "Pulso del mercado" });
      return;
    }
    const raw = article.title.trim();
    const short = raw.length > 42 ? `${raw.slice(0, 39)}…` : raw;
    navigation.setOptions({ title: short });
  }, [navigation, article]);

  if (!article) {
    return (
      <SafeAreaView style={styles.wrap} edges={["bottom"]}>
        <View style={styles.emptyHero}>
          <View style={styles.emptyIconRing}>
            <MaterialCommunityIcons name="newspaper-variant-outline" size={34} color={colors.primary} />
          </View>
          <Text style={[typography.headlineMd, styles.emptyTitle]}>Noticia no disponible</Text>
          <Text style={[typography.bodyMd, styles.hint]}>
            Volvé al listado y abrila de nuevo para sincronizar el contenido.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const openBrowser = () => {
    if (article.url) void Linking.openURL(article.url);
  };

  const bottomPad = Math.max(insets.bottom, spacing.md) + spacing.lg;
  const webHost = article.url ? hostLabel(article.url) : "";
  const readWebMarginTop = previewParagraphs.length > 0 ? spacing.sm : spacing.lg;

  return (
    <SafeAreaView style={styles.page} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainCard}>
          {article.imageUrl ? (
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.heroInCard}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.heroInCardPh}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={44} color={colors.outline} />
            </View>
          )}

          <View style={styles.cardPad}>
            <View style={styles.metaPanel}>
              <View style={styles.detailMetaTop}>
                <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                  <Text style={[styles.pillTxt, { color: pill.fg }]}>{pill.label}</Text>
                </View>
                <View style={styles.readRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={colors.onSurfaceVariant} />
                  <Text style={styles.readTxt}>
                    {readMin} min · {whenRel}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.title}>{article.title}</Text>

            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{initials}</Text>
              </View>
              <View style={styles.authorCol}>
                <Text style={styles.sourceName} numberOfLines={1}>
                  {article.source}
                </Text>
                <Text style={styles.dateLine}>{whenFull}</Text>
              </View>
            </View>

            {previewParagraphs.length > 0 ? (
              <>
                <View style={styles.divider} />
                <View style={styles.bodyBlock}>
                  {previewParagraphs.map((para, i) => (
                    <Text
                      key={i}
                      style={[styles.bodyPara, i === previewParagraphs.length - 1 ? styles.bodyParaLast : null]}
                    >
                      {para}
                    </Text>
                  ))}
                </View>
              </>
            ) : null}

            {article.url ? (
              <Pressable
                onPress={openBrowser}
                accessibilityRole="link"
                accessibilityLabel={`Seguir leyendo en ${webHost}`}
                style={({ pressed }) => [
                  styles.primaryCta,
                  { marginTop: readWebMarginTop },
                  pressed && styles.primaryCtaPressed,
                ]}
              >
                <View style={styles.primaryCtaInner}>
                  <MaterialCommunityIcons name="book-open-page-variant" size={22} color={colors.onPrimary} />
                  <Text style={styles.primaryCtaTxt} numberOfLines={1}>
                    Seguí leyendo en la web
                  </Text>
                </View>
                <MaterialCommunityIcons name="open-in-new" size={20} color={colors.onPrimary} />
              </Pressable>
            ) : hasMoreContent ? (
              <View style={[styles.extractOnlyHint, { marginTop: readWebMarginTop }]}>
                <MaterialCommunityIcons name="information-outline" size={22} color={colors.onSurfaceVariant} />
                <Text style={styles.extractOnlyTxt}>Solo tenemos este extracto en la app.</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  emptyHero: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    alignSelf: "stretch",
    overflow: "hidden",
    ...toolbarPanelShadow,
  },
  emptyIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  emptyTitle: {
    textAlign: "center",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  hint: {
    textAlign: "center",
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  mainCard: {
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLowest,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...cardShadow,
  },
  heroInCard: {
    width: "100%",
    aspectRatio: 16 / 9,
    maxHeight: 220,
    backgroundColor: colors.surfaceContainerLow,
  },
  heroInCardPh: {
    width: "100%",
    aspectRatio: 16 / 9,
    maxHeight: 220,
    minHeight: 160,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: "center",
    alignItems: "center",
  },
  cardPad: {
    padding: spacing.lg,
    gap: 0,
  },
  metaPanel: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  detailMetaTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  pillTxt: {
    ...typography.caption,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.3,
  },
  readRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  readTxt: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    fontWeight: "500",
  },
  title: {
    ...typography.headlineMd,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    ...typography.labelMd,
    fontWeight: "800",
    color: colors.onPrimary,
    fontSize: 13,
  },
  authorCol: {
    flex: 1,
    minWidth: 0,
  },
  sourceName: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  dateLine: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  bodyBlock: {
    marginBottom: spacing.lg,
  },
  bodyPara: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "500",
    fontSize: 17,
    lineHeight: 28,
    marginBottom: spacing.base,
  },
  bodyParaLast: {
    marginBottom: 0,
  },
  extractOnlyHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  extractOnlyTxt: {
    ...typography.bodyMd,
    flex: 1,
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    alignSelf: "stretch",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  primaryCtaPressed: {
    opacity: 0.92,
  },
  primaryCtaInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 0,
  },
  primaryCtaTxt: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
});
