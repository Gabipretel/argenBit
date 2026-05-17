import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { formatUsd } from "@/common/utils/formatters";
import { useTopCoinsInfiniteQuery } from "@/features/markets/hooks/useTopCoinsInfiniteQuery";
import type { Asset } from "@/domain/models/Asset";
import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

type MarketSuggestionsQuery = Pick<
  ReturnType<typeof useTopCoinsInfiniteQuery>,
  "isPending" | "isError" | "isFetching" | "data" | "refetch" | "dataUpdatedAt"
>;

interface FavoritesSuggestionsSectionProps {
  suggestedAssets: Asset[];
  marketSuggestionsQuery: MarketSuggestionsQuery;
  onAssetPress: (asset: Asset) => void;
  topSpacing?: number;
}

export const FavoritesSuggestionsSection = memo(function FavoritesSuggestionsSection({
  suggestedAssets,
  marketSuggestionsQuery,
  onAssetPress,
  topSpacing = 0,
}: FavoritesSuggestionsSectionProps) {
  return (
    <View style={[styles.suggestSectionRoot, topSpacing > 0 && { paddingTop: topSpacing }]}>
      <View style={styles.suggestBlock}>
        <View style={styles.suggestHeaderRow}>
          <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={colors.primary} />
          <Text style={styles.suggestTitle}>Sugerencias para vos</Text>
        </View>
        <View style={styles.suggestPill}>
          <Text style={styles.suggestPillTxt}>Top por capitalización</Text>
        </View>
      </View>

      {marketSuggestionsQuery.isPending && !marketSuggestionsQuery.data ? null : marketSuggestionsQuery.isError ? (
        <Text style={[typography.bodyMd, styles.suggestErr]}>
          No pudimos cargar sugerencias. Probá tirar hacia abajo para reintentar.
        </Text>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.suggestRow, styles.suggestRowAlign]}
        >
          {suggestedAssets.map((asset) => (
            <Pressable
              key={asset.fsym}
              onPress={() => onAssetPress(asset)}
              style={({ pressed }) => [styles.suggestCard, pressed && styles.suggestCardPressed]}
            >
              <View style={styles.suggestRowInner}>
                <View style={styles.suggestThumbWrap}>
                  {asset.imageUrl ? (
                    <Image
                      source={{ uri: asset.imageUrl }}
                      style={styles.suggestThumb}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.suggestThumb, styles.suggestPh]}>
                      <Text style={styles.suggestPhTxt}>
                        {(asset.symbolDisplay || asset.fsym).slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.suggestMid}>
                  <Text style={styles.suggestNameMain} numberOfLines={1}>
                    {asset.name}
                  </Text>
                  <Text style={[typography.caption, styles.suggestSymSub]} numberOfLines={1}>
                    {asset.symbolDisplay}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outline} />
              </View>
              <Text style={styles.suggestPrice}>{formatUsd(asset.priceUsd)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}, isSameFavoritesSuggestionsProps);

function isSameFavoritesSuggestionsProps(
  previous: FavoritesSuggestionsSectionProps,
  next: FavoritesSuggestionsSectionProps
): boolean {
  if (previous.onAssetPress !== next.onAssetPress) return false;
  if (previous.topSpacing !== next.topSpacing) return false;
  if (previous.marketSuggestionsQuery.isPending !== next.marketSuggestionsQuery.isPending) return false;
  if (previous.marketSuggestionsQuery.isError !== next.marketSuggestionsQuery.isError) return false;
  if (previous.marketSuggestionsQuery.dataUpdatedAt !== next.marketSuggestionsQuery.dataUpdatedAt) {
    return false;
  }
  if (previous.suggestedAssets.length !== next.suggestedAssets.length) return false;
  for (let index = 0; index < previous.suggestedAssets.length; index++) {
    const previousAsset = previous.suggestedAssets[index];
    const nextAsset = next.suggestedAssets[index];
    if (
      previousAsset.fsym !== nextAsset.fsym ||
      previousAsset.priceUsd !== nextAsset.priceUsd ||
      previousAsset.name !== nextAsset.name ||
      previousAsset.symbolDisplay !== nextAsset.symbolDisplay ||
      previousAsset.imageUrl !== nextAsset.imageUrl
    ) {
      return false;
    }
  }
  return true;
}

const styles = StyleSheet.create({
  suggestSectionRoot: {
    alignSelf: "stretch",
    marginBottom: spacing.sm,
  },
  suggestBlock: {
    marginBottom: spacing.base,
  },
  suggestHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestTitle: {
    flex: 1,
    ...typography.headlineMd,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: colors.primary,
    fontWeight: "800",
  },
  suggestPill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: "rgba(35, 99, 145, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(35, 99, 145, 0.35)",
    marginBottom: spacing.sm,
  },
  suggestPillTxt: {
    ...typography.caption,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.primary,
    textTransform: "uppercase",
  },
  suggestErr: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  suggestRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.base,
    paddingRight: spacing.lg,
  },
  suggestRowAlign: {
    alignItems: "center",
  },
  suggestCard: {
    width: 200,
    minHeight: 96,
    alignSelf: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: "hidden",
    ...cardShadow,
  },
  suggestCardPressed: {
    opacity: 0.94,
    borderColor: colors.primary,
  },
  suggestRowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestThumbWrap: {
    marginRight: 2,
  },
  suggestThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  suggestPh: {
    alignItems: "center",
    justifyContent: "center",
  },
  suggestPhTxt: {
    ...typography.headlineMd,
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
  },
  suggestMid: {
    flex: 1,
    minWidth: 0,
  },
  suggestNameMain: {
    ...typography.labelMd,
    fontSize: 15,
    lineHeight: 20,
    color: colors.onSurface,
    fontWeight: "700",
  },
  suggestSymSub: {
    textTransform: "uppercase",
    marginTop: 2,
    color: colors.onSurfaceVariant,
  },
  suggestPrice: {
    fontSize: 17,
    lineHeight: 24,
    fontVariant: ["tabular-nums"],
    color: colors.onSurface,
    fontWeight: "700",
    textAlign: "right",
  },
});
