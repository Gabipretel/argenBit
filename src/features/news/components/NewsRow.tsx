import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { NewsArticle } from "@/domain/models/NewsArticle";
import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";
import {
  newsPillForArticle,
  newsRelativeShort,
  sourceInitials,
} from "@/common";

interface NewsRowProps {
  article: NewsArticle;
  onPress: () => void;
}

function hueFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue}, 48%, 90%)`;
}

export function NewsRow({ article, onPress }: NewsRowProps) {
  const whenShort = newsRelativeShort(article.publishedOn);
  const pill = useMemo(() => newsPillForArticle(article.id), [article.id]);
  const initials = useMemo(() => sourceInitials(article.source), [article.source]);
  const [imgFailed, setImgFailed] = useState(false);
  const fallbackBg = useMemo(() => hueFromId(article.id), [article.id]);

  const showImage = Boolean(article.imageUrl) && !imgFailed;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${article.title}. ${article.source}. Tocá para abrir la noticia.`}
      style={({ pressed }) => [styles.pressWrap, pressed && styles.pressWrapPressed]}
    >
      {({ pressed }) => (
        <View style={[styles.card, pressed && styles.cardPressed]}>
          <View style={styles.heroClip}>
            {showImage ? (
              <Image
                recyclingKey={article.id}
                source={{ uri: article.imageUrl! }}
                style={styles.heroImg}
                contentFit="cover"
                transition={180}
                onError={() => setImgFailed(true)}
              />
            ) : (
              <View style={[styles.heroPh, { backgroundColor: fallbackBg }]}>
                <MaterialCommunityIcons name="image-filter-center-focus" size={32} color={colors.outline} />
              </View>
            )}
          </View>

          <View style={styles.body}>
            <View style={styles.metaTop}>
              <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                <Text style={[styles.pillTxt, { color: pill.fg }]}>{pill.label}</Text>
              </View>
              <View style={styles.timeWrap}>
                <MaterialCommunityIcons name="clock-outline" size={15} color={colors.onSurfaceVariant} />
                <Text style={styles.timeRel}>{whenShort}</Text>
              </View>
            </View>

            <Text style={styles.title} numberOfLines={3}>
              {article.title}
            </Text>

            <View style={styles.footerStrip}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{initials}</Text>
              </View>
              <Text style={styles.source} numberOfLines={1}>
                {article.source}
              </Text>
              <View accessible={false} style={styles.footerChev}>
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    marginBottom: spacing.base,
    alignSelf: "stretch",
  },
  pressWrapPressed: {
    opacity: 0.98,
  },
  card: {
    alignSelf: "stretch",
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...cardShadow,
  },
  cardPressed: {
    borderColor: colors.primary,
    opacity: 0.97,
  },
  heroClip: {
    width: "100%",
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImg: {
    width: "100%",
    aspectRatio: 16 / 9,
    maxHeight: 132,
    backgroundColor: colors.surfaceContainerLow,
  },
  heroPh: {
    width: "100%",
    aspectRatio: 16 / 9,
    maxHeight: 132,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 0,
  },
  metaTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
    letterSpacing: 0.2,
  },
  timeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  timeRel: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
    fontSize: 12,
  },
  title: {
    ...typography.headlineMd,
    fontSize: 17,
    lineHeight: 24,
    color: colors.onSurface,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  footerStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    ...typography.caption,
    fontWeight: "800",
    color: colors.onPrimary,
    fontSize: 11,
  },
  source: {
    ...typography.labelMd,
    flex: 1,
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: 13,
  },
  footerChev: {
    flexShrink: 0,
  },
});
