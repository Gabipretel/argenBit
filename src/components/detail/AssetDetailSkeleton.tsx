import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { cardShadow, colors, radii, spacing } from "@/theme";

function Ph({ style, shimmer }: { style: object; shimmer: object }) {
  return <Animated.View style={[styles.ph, style, shimmer]} />;
}

/** Placeholder del detalle de activo mientras carga la primera respuesta. */
export function AssetDetailSkeleton() {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.88, { duration: 900 }), -1, true);
  }, [pulse]);

  const shimmer = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View
      style={[styles.root, styles.rootFill]}
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando detalle"
    >
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <Ph style={styles.thumb} shimmer={shimmer} />
          <View style={styles.heroMid}>
            <Ph style={styles.lineLg} shimmer={shimmer} />
            <Ph style={styles.lineSm} shimmer={shimmer} />
          </View>
          <View style={styles.heroRight}>
            <Ph style={styles.priceLine} shimmer={shimmer} />
            <Ph style={styles.badge} shimmer={shimmer} />
          </View>
        </View>
        <Ph style={styles.subnote} shimmer={shimmer} />
      </View>

      <Ph style={styles.sectionTitlePh} shimmer={shimmer} />
      <View style={styles.segmentRow}>
        {[1, 2, 3, 4, 5, 6].map((k) => (
          <Ph key={k} style={styles.segment} shimmer={shimmer} />
        ))}
      </View>

      <Ph style={styles.chart} shimmer={shimmer} />

      <Ph style={styles.sectionTitlePhWide} shimmer={shimmer} />
      <View style={styles.grid}>
        <Ph style={styles.tile} shimmer={shimmer} />
        <Ph style={styles.tile} shimmer={shimmer} />
        <Ph style={styles.tile} shimmer={shimmer} />
        <Ph style={styles.tile} shimmer={shimmer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  rootFill: {
    flex: 1,
    minHeight: 320,
  },
  ph: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.sm,
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
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.sm,
  },
  heroMid: {
    flex: 1,
    gap: 6,
    marginRight: spacing.xs,
  },
  heroRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  lineLg: {
    height: 16,
    width: "72%",
  },
  lineSm: {
    height: 12,
    width: "40%",
  },
  priceLine: {
    height: 22,
    width: 88,
  },
  badge: {
    height: 14,
    width: 56,
    borderRadius: radii.full,
  },
  subnote: {
    height: 12,
    width: "36%",
    marginTop: spacing.sm,
    borderRadius: radii.sm,
  },
  sectionTitlePh: {
    height: 22,
    width: 140,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitlePhWide: {
    height: 22,
    width: 110,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: "wrap",
  },
  segment: {
    width: 52,
    height: 36,
    borderRadius: radii.md,
  },
  chart: {
    width: "100%",
    height: 200,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.base,
  },
  tile: {
    width: "47%",
    height: 96,
    borderRadius: radii.lg,
  },
});
