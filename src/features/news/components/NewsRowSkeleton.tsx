import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { NewsListHeader } from "./NewsListHeader";
import { cardShadow, colors, radii, spacing } from "@/core/theme";

/** Placeholder de fila de noticia (misma silueta que `NewsRow`). */
export function NewsRowSkeleton() {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.85, { duration: 900 }), -1, true);
  }, [pulse]);

  const shimmer = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={styles.pressWrap}>
      <View style={styles.card}>
        <Animated.View style={[styles.ph, styles.hero, shimmer]} />
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Animated.View style={[styles.ph, styles.pill, shimmer]} />
            <Animated.View style={[styles.ph, styles.time, shimmer]} />
          </View>
          <Animated.View style={[styles.ph, styles.titleLine, shimmer]} />
          <Animated.View style={[styles.ph, styles.titleLineShort, shimmer]} />
          <View style={styles.footerStrip}>
            <Animated.View style={[styles.ph, styles.avatar, shimmer]} />
            <Animated.View style={[styles.ph, styles.source, shimmer]} />
            <Animated.View style={[styles.ph, styles.readCue, shimmer]} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function NewsRowSkeletonList({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <NewsRowSkeleton key={i} />
      ))}
    </>
  );
}

/** Cabecera “Pulso del mercado” + filas skeleton (carga inicial / pull to refresh). */
export function NewsFeedSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <>
      <NewsListHeader showChipPanel={false} />
      <NewsRowSkeletonList count={rowCount} />
    </>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    marginBottom: spacing.base,
    alignSelf: "stretch",
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
  ph: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.sm,
  },
  hero: {
    width: "100%",
    aspectRatio: 16 / 9,
    maxHeight: 132,
    backgroundColor: colors.surfaceContainerLow,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 0,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  pill: {
    width: 88,
    height: 24,
    borderRadius: radii.full,
  },
  time: {
    width: 64,
    height: 16,
  },
  titleLine: {
    height: 18,
    width: "92%",
    marginBottom: 8,
  },
  titleLineShort: {
    height: 18,
    width: "58%",
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
  },
  source: {
    flex: 1,
    height: 14,
  },
  readCue: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
  },
});
