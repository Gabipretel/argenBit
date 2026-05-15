import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import { Area, CartesianChart, Line } from "victory-native";

import type { PriceHistoryPoint } from "@/domain/models/AssetDetail";
import { colors, radii, spacing, typography } from "@/theme";

type ChartTone = "up" | "down" | "flat";

interface Props {
  data: PriceHistoryPoint[];
  isLoading?: boolean;
  /** Si la serie es casi plana, se usa para el color (p. ej. stablecoins con rango plano pero +24h). */
  changePct24h?: number;
}

function chartToneFromSeries(points: PriceHistoryPoint[]): ChartTone {
  if (points.length < 2) return "flat";
  const a = points[0]!.price;
  const b = points[points.length - 1]!.price;
  const eps = Math.max(Math.abs(a), Math.abs(b), 1) * 1e-9;
  if (b > a + eps) return "up";
  if (b < a - eps) return "down";
  return "flat";
}

function resolveChartTone(
  points: PriceHistoryPoint[],
  changePct24h?: number
): ChartTone {
  const fromSeries = chartToneFromSeries(points);
  if (fromSeries !== "flat") return fromSeries;
  if (changePct24h == null || Number.isNaN(changePct24h)) return "flat";
  if (changePct24h > 0) return "up";
  if (changePct24h < 0) return "down";
  return "flat";
}

function toneColors(tone: ChartTone): { line: string; area: string } {
  if (tone === "up") {
    return { line: colors.success, area: "rgba(5, 150, 105, 0.18)" };
  }
  if (tone === "down") {
    return { line: colors.error, area: "rgba(186, 26, 26, 0.12)" };
  }
  return { line: colors.outlineVariant, area: "rgba(193, 199, 208, 0.22)" };
}

function ChartSkeleton() {
  const opacity = useRef(new Animated.Value(0.38)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.82,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.38,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View
      style={[styles.box, styles.skelWrap]}
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando gráfico de precio"
    >
      <Animated.View style={[styles.skelCard, { opacity }]} />
      <View style={styles.skelSpinnerOverlay} pointerEvents="none">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </View>
  );
}

/**
 * victory-native XL + Skia — color de línea según tendencia del rango (primer vs último punto).
 */
export function PriceChart({ data, isLoading, changePct24h }: Props) {
  const tone = useMemo(
    () => resolveChartTone(data, changePct24h),
    [data, changePct24h]
  );
  const { line, area } = toneColors(tone);

  if (isLoading && data.length === 0) {
    return <ChartSkeleton />;
  }

  if (data.length < 2) {
    return (
      <View style={[styles.box, styles.center]}>
        <Text style={[typography.bodyMd, styles.emptyTxt]}>
          No hay suficientes datos para el gráfico.
        </Text>
      </View>
    );
  }

  const chartData = data.map((d) => ({ idx: d.idx, price: d.price }));

  return (
    <View style={styles.box}>
      <CartesianChart
        data={chartData}
        xKey="idx"
        yKeys={["price"]}
        padding={{ left: 4, right: 8, top: 12, bottom: 8 }}
      >
        {({ points, chartBounds }) => (
          <>
            <Area
              points={points.price}
              y0={chartBounds.bottom}
              color={area}
              opacity={1}
            />
            <Line
              points={points.price}
              color={line}
              strokeWidth={2.5}
              strokeCap="round"
              strokeJoin="round"
            />
          </>
        )}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 208,
    marginTop: 2,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: "hidden",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  emptyTxt: {
    textAlign: "center",
    color: colors.onSurfaceVariant,
  },
  skelWrap: {
    justifyContent: "center",
    alignItems: "stretch",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  skelCard: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerHigh,
    minHeight: 120,
  },
  skelSpinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
