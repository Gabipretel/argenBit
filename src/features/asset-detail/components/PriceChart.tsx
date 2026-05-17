import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { buildSparkSeries } from "@/common/utils/sparkSeries";
import type { PriceChangeHorizonPoint } from "@/domain/models/PriceChangeHorizon";
import {
  MiniSparkline,
  type SparkTone,
} from "@/features/markets/components/MiniSparkline";
import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

interface Props {
  fsym: string;
  points: PriceChangeHorizonPoint[];
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

/** Rendimiento en detalle: chips por ventana + spark + % de la ventana activa. */
export function PriceChart({ fsym, points }: Props) {
  const { width: screenW } = useWindowDimensions();
  const chartWidth = Math.max(200, screenW - spacing.lg * 2);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const safeIdx =
    selectedIdx >= 0 && selectedIdx < points.length ? selectedIdx : 0;
  const selected = points[safeIdx];
  const changePct = selected?.changePct ?? 0;

  const sparkPoints = useMemo(
    () => buildSparkSeries(fsym, changePct),
    [fsym, changePct]
  );
  const tone = useMemo(() => toneFromChangePct(changePct), [changePct]);

  if (points.length < 2 || sparkPoints.length < 2) {
    return (
      <View style={[styles.box, styles.center]}>
        <Text style={[typography.bodyMd, styles.emptyTxt]}>
          Rendimiento no disponible para este activo.
        </Text>
      </View>
    );
  }

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
          {points.map((p, idx) => {
            const active = idx === safeIdx;
            return (
              <Pressable
                key={p.label}
                onPress={() => setSelectedIdx(idx)}
                style={[styles.segment, active && styles.segmentActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Ventana ${p.label}, variación ${formatPct(p.changePct)}`}
              >
                <Text style={[styles.segmentTxt, active && styles.segmentTxtActive]}>
                  {p.label}
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
        <MiniSparkline
          points={sparkPoints}
          tone={tone}
          width={chartWidth - spacing.md * 2}
          height={120}
        />
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
    height: 46,
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
  center: {
    height: 168,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  emptyTxt: {
    textAlign: "center",
    color: colors.onSurfaceVariant,
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
});
