import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { buildSparkSeries } from "@/common/utils/sparkSeries";
import type { CoinChartPeriod } from "@/core/api/dto/coinChart";
import {
  COIN_CHART_PERIODS,
  DEFAULT_COIN_CHART_PERIOD,
} from "@/core/config/coinChartPeriods";
import {
  MiniSparkline,
  type SparkTone,
} from "@/features/markets/components/MiniSparkline";
import { useCoinChartQuery } from "../hooks/useCoinChartQuery";
import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

interface Props {
  coinId: string;
  fsym: string;
}

function toneFromChangePct(changePct: number): SparkTone {
  if (changePct > 0) return "up";
  if (changePct < 0) return "down";
  return "flat";
}

function formatPct(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

/** Histórico CoinStats por periodo API (24h, 1w, 1m, …). */
export function PriceChart({ coinId, fsym }: Props) {
  const { width: screenW } = useWindowDimensions();
  const chartWidth = Math.max(200, screenW - spacing.lg * 2);
  const [period, setPeriod] = useState<CoinChartPeriod>(DEFAULT_COIN_CHART_PERIOD);
  const chartQuery = useCoinChartQuery(coinId, period);

  const changePct = chartQuery.data?.changePct ?? 0;
  const sparkPoints = useMemo(() => {
    const fromApi = chartQuery.data?.sparkPoints;
    if (fromApi && fromApi.length >= 2) return fromApi;
    return buildSparkSeries(fsym, changePct);
  }, [chartQuery.data?.sparkPoints, fsym, changePct]);

  const tone = useMemo(() => toneFromChangePct(changePct), [changePct]);

  return (
    <View style={styles.wrap}>
      <View style={styles.segmentStrip}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.segmentRowContent}
        >
          {COIN_CHART_PERIODS.map(({ period: p, label }) => {
            const active = p === period;
            return (
              <Pressable
                key={p}
                testID={`chart-period-${p}`}
                onPress={() => setPeriod(p)}
                style={[styles.segment, active && styles.segmentActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Periodo ${label}`}
              >
                <Text style={[styles.segmentTxt, active && styles.segmentTxtActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.box}>
        <Text
          style={[
            styles.selectedPct,
            changePct > 0 && styles.pctUp,
            changePct < 0 && styles.pctDown,
          ]}
        >
          {formatPct(changePct)}
        </Text>
        {chartQuery.isPending && !chartQuery.data ? (
          <ActivityIndicator color={colors.primary} style={styles.chartLoader} />
        ) : (
          <MiniSparkline
            points={sparkPoints}
            tone={tone}
            width={chartWidth - spacing.md * 2}
            height={120}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 2,
  },
  segmentStrip: {
    alignSelf: "stretch",
    minHeight: 46,
    marginBottom: spacing.sm,
    flexGrow: 0,
    flexShrink: 0,
  },
  segmentRowContent: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: spacing.sm,
    paddingRight: spacing.lg,
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
  },
  segmentTxt: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  segmentTxtActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  box: {
    alignSelf: "stretch",
    marginBottom: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: "hidden",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    ...cardShadow,
  },
  selectedPct: {
    ...typography.headlineMd,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  pctUp: {
    color: colors.success,
  },
  pctDown: {
    color: colors.error,
  },
  chartLoader: {
    marginVertical: spacing.xl,
  },
});
