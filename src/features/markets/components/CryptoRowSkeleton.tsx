import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { cardShadow, colors, radii, spacing } from "@/core/theme";

export function CryptoRowSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CryptoRowSkeleton key={i} />
      ))}
    </>
  );
}

export function CryptoRowSkeleton() {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.85, { duration: 900 }), -1, true);
  }, [pulse]);

  const shimmer = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Animated.View style={[styles.ph, styles.thumb, shimmer]} />
        <View style={styles.mid}>
          <Animated.View style={[styles.ph, styles.lineLg, shimmer]} />
          <Animated.View style={[styles.ph, styles.lineSm, shimmer]} />
        </View>
        <Animated.View style={[styles.ph, styles.spark, shimmer]} />
        <View style={styles.right}>
          <Animated.View style={[styles.ph, styles.price, shimmer]} />
          <Animated.View style={[styles.ph, styles.badge, shimmer]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.base,
    alignSelf: "stretch",
  },
  card: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...cardShadow,
  },
  ph: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.sm,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.sm,
  },
  mid: {
    flex: 1,
    gap: 6,
    marginRight: spacing.xs,
  },
  spark: {
    width: 64,
    height: 36,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  lineLg: {
    height: 16,
    width: "72%",
  },
  lineSm: {
    height: 12,
    width: "40%",
  },
  right: {
    alignItems: "flex-end",
    gap: 8,
  },
  price: {
    height: 22,
    width: 88,
  },
  badge: {
    height: 14,
    width: 56,
    borderRadius: radii.full,
  },
});
