import { Image } from "expo-image";
import { memo, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AnimatedUsdPrice } from "./AnimatedUsdPrice";
import { MiniSparkline, type SparkTone } from "./MiniSparkline";
import type { Asset } from "@/domain/models/Asset";
import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";
import { formatUsd } from "@/common/utils/formatters";
import { buildSparkSeries } from "@/common/utils/sparkSeries";

const THUMB_SIZE = 44;

interface Props {
  asset: Asset;
  onPress: () => void;
  chartSparkPoints?: number[] | null;
}

export const CryptoRow = memo(function CryptoRow({
  asset,
  onPress,
  chartSparkPoints,
}: Props) {
  const change24h =
    typeof asset.changePercent24Hr === "number" && Number.isFinite(asset.changePercent24Hr)
      ? asset.changePercent24Hr
      : 0;
  const positive = change24h > 0;
  const negative = change24h < 0;
  const [imageFailed, setImageFailed] = useState(false);

  const tone: SparkTone = positive ? "up" : negative ? "down" : "flat";
  const sparkPoints = useMemo(() => {
    if (chartSparkPoints && chartSparkPoints.length >= 2) return chartSparkPoints;
    return buildSparkSeries(asset.fsym, change24h);
  }, [asset.fsym, change24h, chartSparkPoints]);

  useEffect(() => {
    setImageFailed(false);
  }, [asset.fsym, asset.imageUrl]);

  const label = `${asset.name}, ${asset.symbolDisplay}, posición ${asset.rank}, precio ${formatUsd(asset.priceUsd)}`;
  const showRemoteThumb = Boolean(asset.imageUrl) && !imageFailed;

  return (
    <Pressable
      testID={`crypto-row-${asset.fsym}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.pressWrap, pressed && styles.pressed]}
    >
      <View style={styles.card}>
          <View style={styles.thumbWrap}>
            {showRemoteThumb ? (
              <Image
                testID={`crypto-row-thumb-${asset.fsym}`}
                source={{ uri: asset.imageUrl! }}
                style={styles.thumb}
                contentFit="cover"
                transition={120}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Text style={styles.thumbInitial} numberOfLines={1}>
                  {(asset.symbolDisplay || asset.fsym).slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.mid}>
            <Text style={styles.name} numberOfLines={1}>
              {asset.name}
            </Text>
            <Text style={[typography.caption, styles.sym]} numberOfLines={1}>
              {asset.symbolDisplay}
            </Text>
          </View>
          <View style={styles.sparkWrap}>
            <MiniSparkline points={sparkPoints} tone={tone} width={64} height={36} />
          </View>
          <View style={styles.right}>
            <AnimatedUsdPrice
              priceUsd={asset.priceUsd}
              format={formatUsd}
              textStyle={styles.price}
              align="end"
            />
            <View
              style={[
                styles.badge,
                positive && styles.badgeUp,
                negative && styles.badgeDown,
                !positive && !negative && styles.badgeNeutral,
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  positive && styles.txtUp,
                  negative && styles.txtDown,
                  !positive && !negative && styles.txtNeutral,
                ]}
              >
                {change24h >= 0 ? "+" : ""}
                {change24h.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
    </Pressable>
  );
}, pricePropsEqual);

function pricePropsEqual(prev: Props, next: Props) {
  const a = prev.asset;
  const b = next.asset;
  return (
    a.fsym === b.fsym &&
    a.rank === b.rank &&
    a.name === b.name &&
    a.symbolDisplay === b.symbolDisplay &&
    a.priceUsd === b.priceUsd &&
    a.changePercent24Hr === b.changePercent24Hr &&
    a.imageUrl === b.imageUrl &&
    prev.chartSparkPoints === next.chartSparkPoints
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    marginBottom: spacing.base,
    alignSelf: "stretch",
  },
  pressed: {
    opacity: 0.94,
  },
  card: {
    alignSelf: "stretch",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: "hidden",
    ...cardShadow,
  },
  thumbWrap: {
    marginRight: spacing.sm,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  thumbPlaceholder: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  thumbInitial: {
    ...typography.headlineMd,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  mid: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.xs,
  },
  name: {
    ...typography.labelMd,
    fontSize: 15,
    lineHeight: 20,
    color: colors.onSurface,
    fontWeight: "700",
  },
  sym: {
    textTransform: "uppercase",
    marginTop: 2,
    color: colors.onSurfaceVariant,
  },
  sparkWrap: {
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  right: {
    alignItems: "flex-end",
    minWidth: 102,
    flexShrink: 0,
  },
  price: {
    fontSize: 18,
    lineHeight: 26,
    fontVariant: ["tabular-nums"],
    color: colors.onSurface,
    fontWeight: "700",
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  badgeUp: {
    backgroundColor: colors.success,
  },
  badgeDown: {
    backgroundColor: "rgba(186, 26, 26, 0.14)",
  },
  badgeNeutral: {
    backgroundColor: colors.surfaceContainerLow,
  },
  txtUp: {
    color: colors.onPrimary,
    fontWeight: "700",
  },
  txtDown: {
    color: colors.error,
    fontWeight: "700",
  },
  txtNeutral: {
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
});
