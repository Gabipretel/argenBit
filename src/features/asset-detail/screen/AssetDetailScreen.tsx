import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { useCallback, useLayoutEffect, useState } from "react";
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

import {
  ErrorCallout,
  formatCompactNumber,
  formatSupply,
  formatUsd,
  useBinancePriceStream,
  useMinDurationActive,
} from "@/common";
import { AnimatedUsdPrice, CryptoRowSkeletonList } from "@/features/markets";
import { useFavorites } from "@/hooks/useFavorites";
import { AssetDetailSkeleton } from "../components/AssetDetailSkeleton";
import { PriceChart } from "../components/PriceChart";
import { useAssetDetailQuery } from "../hooks/useAssetDetailQuery";
import { useAssetHistoryQuery } from "../hooks/useAssetHistoryQuery";
import type { HistoryRangeId, PriceHistoryPoint } from "@/domain/models/AssetDetail";
import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

interface AssetDetailRouteParams {
  fsym: string;
  coinId: string;
  displayName?: string;
  rank?: number;
}

const RANGE_OPTIONS: { id: HistoryRangeId; label: string }[] = [
  { id: "1h", label: "1 h" },
  { id: "24h", label: "24 h" },
  { id: "7d", label: "7 d" },
  { id: "6m", label: "6 m" },
  { id: "1y", label: "1 a" },
  { id: "all", label: "Todo" },
];

export function AssetDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { fsym, coinId, displayName, rank } = route.params as AssetDetailRouteParams;
  const [range, setRange] = useState<HistoryRangeId>("7d");
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(fsym);

  useBinancePriceStream([fsym.trim().toUpperCase()], isFocused);

  const detailQuery = useAssetDetailQuery(fsym, coinId, displayName);
  const historyQuery = useAssetHistoryQuery(coinId, range);
  const chartPoints: PriceHistoryPoint[] = historyQuery.data ?? [];

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

  const onRefresh = useCallback(() => {
    void Promise.all([detailQuery.refetch(), historyQuery.refetch()]);
  }, [detailQuery, historyQuery]);

  /** No mezclar el primer fetch del histórico con el spinner de pull (evita parpadeos y “no aparece”). */
  const chartsInitialLoad = historyQuery.isPending && chartPoints.length === 0;
  const refreshingRaw =
    Boolean(detailQuery.data) &&
    !chartsInitialLoad &&
    (detailQuery.isFetching || historyQuery.isFetching);
  const refreshingUi = useMinDurationActive(refreshingRaw, 550);

  if (detailQuery.isError) {
    return (
      <View style={styles.centered}>
        <ErrorCallout
          title="No se pudo cargar"
          message="No pudimos obtener el detalle de este activo. Reintentá o volvé atrás y elegí de nuevo."
          onRetry={() => void detailQuery.refetch()}
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
  const positive = d.changePercent24Hr > 0;
  const negative = d.changePercent24Hr < 0;

  return (
    <View style={styles.pageRoot}>
      <View style={styles.detailShell}>
        {refreshingUi ? (
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
          refreshControl={
            <RefreshControl
              refreshing={refreshingUi}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressViewOffset={Platform.OS === "android" ? 8 : undefined}
            />
          }
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
                    {d.changePercent24Hr >= 0 ? "+" : ""}
                    {d.changePercent24Hr.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.heroSubnote}>Variación 24 h</Text>
          </View>

          <Text style={styles.sectionTitle}>Rendimiento</Text>
          <View style={styles.segmentStrip}>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.segmentScroll}
              contentContainerStyle={styles.segmentRowContent}
            >
              {RANGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => setRange(opt.id)}
                  style={[styles.segment, range === opt.id && styles.segmentActive]}
                >
                  <Text
                    style={[styles.segmentTxt, range === opt.id && styles.segmentTxtActive]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {historyQuery.isError ? (
            <Text style={[typography.bodyMd, styles.chartErr]}>Histórico no disponible.</Text>
          ) : null}

          <PriceChart
            data={chartPoints}
            isLoading={historyQuery.isPending && chartPoints.length === 0}
            changePct24h={d.changePercent24Hr}
          />

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
              variant="rank"
              icon="podium"
              label="Ranking"
              value={rank != null ? `#${rank}` : "—"}
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
  rank: colors.tabBarActive,
} as const;

function MetricTile({
  variant,
  icon,
  label,
  value,
}: {
  variant: keyof typeof TILE_ICONS;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
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
  segmentStrip: {
    alignSelf: "stretch",
    height: 46,
    marginBottom: spacing.sm,
    flexGrow: 0,
    flexShrink: 0,
  },
  segmentScroll: {
    flexGrow: 0,
    maxHeight: 46,
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
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitleMetrics: {
    ...typography.headlineMd,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  segmentRowContent: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: spacing.sm,
    paddingRight: spacing.lg,
    paddingVertical: 0,
    flexGrow: 0,
  },
  segment: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minWidth: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  segmentActive: {
    backgroundColor: "rgba(35, 99, 145, 0.1)",
    borderColor: colors.primary,
    borderRadius: radii.md,
  },
  segmentTxt: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  segmentTxtActive: {
    color: colors.primary,
    fontWeight: "700",
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
});
