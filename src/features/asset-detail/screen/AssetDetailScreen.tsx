import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { useCallback, useLayoutEffect, useMemo } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";

import { ErrorCallout } from "@/common/components/ui/ErrorCallout";
import { useBinancePriceStream } from "@/common/hooks/useBinancePriceStream";
import { useMinDurationActive } from "@/common/hooks/useMinDurationActive";
import {
  formatCompactNumber,
  formatScore0to100,
  formatSupply,
  formatUsd,
} from "@/common/utils/formatters";
import type { AssetDetailParams } from "@/core/navigation/assetDetailParams";
import { AnimatedUsdPrice } from "@/features/markets/components/AnimatedUsdPrice";
import { CryptoRowSkeletonList } from "@/features/markets/components/CryptoRowSkeleton";
import { useFavorites } from "@/features/favorites/FavoritesContext";
import { AssetDetailSkeleton } from "../components/AssetDetailSkeleton";
import {
  coinChartPeriodLabel,
  DEFAULT_COIN_CHART_PERIOD,
} from "@/core/config/coinChartPeriods";
import { PriceChart } from "../components/PriceChart";
import { useAssetDetailQuery } from "../hooks/useAssetDetailQuery";
import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

export function AssetDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const {
    fsym,
    coinId,
    displayName,
    riskScore,
    volatilityScore,
    liquidityScore,
  } = route.params as AssetDetailParams;
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(fsym);

  useBinancePriceStream([fsym.trim().toUpperCase()], isFocused);

  const detailQuery = useAssetDetailQuery(fsym, coinId, displayName);

  useLayoutEffect(() => {
    const label = (displayName?.trim() || fsym.toUpperCase()).trim();
    const title = label.length > 24 ? `${label.slice(0, 21)}…` : label;
    navigation.setOptions({
      title,
      headerRight: () => (
        <Pressable
          onPress={() => toggle({ coinId, fsym: fsym.trim().toUpperCase() })}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <MaterialCommunityIcons
            name={fav ? "star" : "star-outline"}
            size={26}
            color={colors.primary}
          />
        </Pressable>
      ),
    });
  }, [navigation, fsym, coinId, displayName, fav, toggle]);

  const refreshAssetDetail = useCallback(() => {
    void detailQuery.refetch();
  }, [detailQuery]);

  const showPullRefreshSpinner = useMinDurationActive(
    Boolean(detailQuery.data) && detailQuery.isFetching,
    550
  );

  const detailRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={showPullRefreshSpinner}
        onRefresh={refreshAssetDetail}
        tintColor={colors.primary}
        colors={[colors.primary]}
        progressViewOffset={Platform.OS === "android" ? 8 : undefined}
      />
    ),
    [showPullRefreshSpinner, refreshAssetDetail]
  );

  if (detailQuery.isError) {
    return (
      <View style={styles.centered}>
        <ErrorCallout
          title="Detalle del activo no disponible"
          message="Por el momento no se encuentra disponible el detalle del activo. Por favor, inténtelo más tarde."
          onRetry={() => detailQuery.refetch()}
        />
      </View>
    );
  }

  if (!detailQuery.data) {
    return (
      <View style={styles.pageRoot}>
        <AssetDetailSkeleton />
      </View>
    );
  }

  const d = detailQuery.data;
  const change24h = d.priceChange1d;
  const positive = change24h > 0;
  const negative = change24h < 0;
  const chartPeriodLabel = coinChartPeriodLabel(DEFAULT_COIN_CHART_PERIOD);

  return (
    <View style={styles.pageRoot}>
      <View style={styles.detailShell}>
        {showPullRefreshSpinner ? (
          <View style={styles.refreshOverlay} pointerEvents="auto">
            <CryptoRowSkeletonList count={4} />
            <View style={styles.refreshChartPh} />
            <CryptoRowSkeletonList count={2} />
          </View>
        ) : null}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled
          {...(Platform.OS === "android" ? { overScrollMode: "always" as const } : {})}
          refreshControl={detailRefreshControl}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroRow}>
              {d.imageUrl ? (
                <Image source={{ uri: d.imageUrl }} style={styles.heroThumb} contentFit="cover" />
              ) : (
                <View style={[styles.heroThumb, styles.heroThumbPh]}>
                  <Text style={styles.heroThumbInitial} numberOfLines={1}>
                    {(d.symbolDisplay || fsym).slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.heroMid}>
                <Text style={styles.heroName} numberOfLines={2}>
                  {d.name}
                </Text>
                <Text style={[typography.caption, styles.sym]} numberOfLines={1}>
                  {d.symbolDisplay}
                </Text>
              </View>
              <View style={styles.heroRight}>
                <AnimatedUsdPrice
                  priceUsd={d.priceUsd}
                  format={formatUsd}
                  textStyle={styles.heroPrice}
                  align="end"
                />
                <View
                  style={[
                    styles.changeBadge,
                    positive && styles.changeBadgeUp,
                    negative && styles.changeBadgeDown,
                    !positive && !negative && styles.changeBadgeNeutral,
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      positive && styles.changeTxtUp,
                      negative && styles.changeTxtDown,
                      !positive && !negative && styles.changeTxtNeutral,
                    ]}
                  >
                    {change24h >= 0 ? "+" : ""}
                    {change24h.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.heroSubnote}>Variación {chartPeriodLabel}</Text>
          </View>

          <Text style={styles.sectionTitle}>Rendimiento</Text>
          <PriceChart key={d.coinId} coinId={d.coinId} fsym={d.fsym} />

          <Text style={styles.sectionTitleMetrics}>Métricas</Text>
          <View style={styles.grid}>
            <MetricTile
              variant="cap"
              icon="chart-pie"
              label="Market cap"
              value={d.marketCapUsd != null ? `$${formatCompactNumber(d.marketCapUsd)}` : "—"}
            />
            <MetricTile
              variant="vol"
              icon="chart-bar"
              label="Volumen 24h"
              value={d.volume24hUsd != null ? `$${formatCompactNumber(d.volume24hUsd)}` : "—"}
            />
            <MetricTile
              variant="circ"
              icon="infinity"
              label="Circulante"
              value={
                d.circulatingSupply != null ? formatSupply(d.circulatingSupply) : "—"
              }
            />
            <MetricTile
              variant="risk"
              icon="shield-alert-outline"
              label="Riesgo"
              value={riskScore != null ? formatScore0to100(riskScore) : "—"}
              hint="/100"
            />
            <MetricTile
              variant="volatility"
              icon="chart-timeline-variant"
              label="Volatilidad"
              value={volatilityScore != null ? formatScore0to100(volatilityScore) : "—"}
              hint="/100"
            />
            <MetricTile
              variant="liquidity"
              icon="water-outline"
              label="Liquidez"
              value={liquidityScore != null ? formatScore0to100(liquidityScore) : "—"}
              hint="/100"
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const TILE_ICONS = {
  cap: colors.primary,
  vol: colors.success,
  circ: "#7c3aed" as const,
  risk: colors.error,
  volatility: "#d97706" as const,
  liquidity: "#0891b2" as const,
} as const;

function MetricTile({
  variant,
  icon,
  label,
  value,
  hint,
}: {
  variant: keyof typeof TILE_ICONS;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
  hint?: string;
}) {
  const iconColor = TILE_ICONS[variant];
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
        <Text style={[typography.caption, styles.tileLabel]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <Text style={styles.tileValue} numberOfLines={2}>
        {value}
        {hint && value !== "—" ? (
          <Text style={styles.tileValueHint}>{hint}</Text>
        ) : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pageRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailShell: {
    flex: 1,
    position: "relative",
  },
  refreshOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  refreshChartPh: {
    height: 200,
    marginVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  heroCard: {
    alignSelf: "stretch",
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...cardShadow,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  heroThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  heroThumbPh: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroThumbInitial: {
    ...typography.headlineMd,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  heroMid: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.xs,
  },
  heroName: {
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
  heroRight: {
    alignItems: "flex-end",
    minWidth: 100,
    flexShrink: 0,
  },
  heroPrice: {
    fontSize: 18,
    lineHeight: 26,
    fontVariant: ["tabular-nums"],
    color: colors.onSurface,
    fontWeight: "700",
  },
  changeBadge: {
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  changeBadgeUp: {
    backgroundColor: colors.success,
  },
  changeBadgeDown: {
    backgroundColor: "rgba(186, 26, 26, 0.14)",
  },
  changeBadgeNeutral: {
    backgroundColor: colors.surfaceContainerLow,
  },
  changeTxtUp: {
    color: colors.onPrimary,
    fontWeight: "700",
  },
  changeTxtDown: {
    color: colors.error,
    fontWeight: "700",
  },
  changeTxtNeutral: {
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  heroSubnote: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionTitleMetrics: {
    ...typography.headlineMd,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  chartErr: {
    color: colors.error,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.base,
    marginTop: spacing.xs,
  },
  metricCard: {
    width: "47%",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    ...cardShadow,
  },
  metricTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 0,
  },
  tileLabel: {
    flex: 1,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  tileValue: {
    ...typography.labelMd,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.onSurface,
    fontVariant: ["tabular-nums"],
  },
  tileValueHint: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
  },
});
