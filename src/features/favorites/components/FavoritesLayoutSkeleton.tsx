import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { CryptoRowSkeleton } from "@/features/markets/components/CryptoRowSkeleton";
import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

const SUGGEST_CARD_W = 200;
const SUGGEST_CARD_MIN_H = 96;
const PULSE_MS = 900;

function useShimmerStyle() {
  const pulse = useSharedValue(0.45);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.85, { duration: PULSE_MS }), -1, true);
  }, [pulse]);
  return useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));
}

function Ph({
  style,
  shimmer,
}: {
  style: object | object[];
  shimmer: ReturnType<typeof useAnimatedStyle>;
}) {
  return <Animated.View style={[styles.phBase, style, shimmer]} />;
}

export function FavoritesEmptyStateSkeleton() {
  const shimmer = useShimmerStyle();
  return (
    <View style={styles.rootPad}>
      <Text style={[typography.headlineMd, styles.screenTitle]}>Mis favoritos</Text>

      <View style={styles.heroCard}>
        <Ph style={styles.heroRing} shimmer={shimmer} />
        <Ph style={styles.heroTitleBar} shimmer={shimmer} />
        <Ph style={styles.heroCtaBar} shimmer={shimmer} />
      </View>

      <View style={styles.sectionTop}>
        <View style={styles.suggestHeaderRow}>
          <Ph style={styles.headerIcon} shimmer={shimmer} />
          <Ph style={styles.suggestTitleBar} shimmer={shimmer} />
        </View>
        <Ph style={styles.pillBar} shimmer={shimmer} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.hRow}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.suggestCard}>
            <View style={styles.suggestCardTop}>
              <Ph style={styles.thumb44} shimmer={shimmer} />
              <View style={styles.suggestMid}>
                <Ph style={styles.lineName} shimmer={shimmer} />
                <Ph style={styles.lineSym} shimmer={shimmer} />
              </View>
              <Ph style={styles.chevSm} shimmer={shimmer} />
            </View>
            <Ph style={styles.priceLine} shimmer={shimmer} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.tipsBlock}>
        <View style={styles.tipsHeaderRow}>
          <Ph style={styles.headerIcon} shimmer={shimmer} />
          <Ph style={styles.tipsTitleBar} shimmer={shimmer} />
        </View>
        {[0, 1].map((i) => (
          <View key={i} style={styles.tipRow}>
            <Ph style={styles.tipIcon} shimmer={shimmer} />
            <Ph style={styles.tipLine} shimmer={shimmer} />
            <Ph style={styles.chevMd} shimmer={shimmer} />
          </View>
        ))}
      </View>
    </View>
  );
}

type ListProps = {
  rowCount: number;
  showFooter?: boolean;
};

/** Título + filas tipo CryptoRow + pie (sugerencias + tips) como en la lista cargada. */
export function FavoritesListInitialSkeleton({ rowCount, showFooter = true }: ListProps) {
  const n = Math.min(Math.max(rowCount, 3), 12);
  return (
    <View style={styles.rootPad}>
      <Text style={[typography.headlineMd, styles.screenTitle]}>Mis favoritos</Text>
      {Array.from({ length: n }).map((_, i) => (
        <CryptoRowSkeleton key={i} />
      ))}
      {showFooter ? <FavoritesFooterOnlySkeleton /> : null}
    </View>
  );
}

export function FavoritesFooterOnlySkeleton() {
  const shimmer = useShimmerStyle();
  return (
    <View style={styles.footerStack}>
      <View style={[styles.sectionTop, { paddingTop: spacing.lg }]}>
        <View style={styles.suggestHeaderRow}>
          <Ph style={styles.headerIcon} shimmer={shimmer} />
          <Ph style={styles.suggestTitleBar} shimmer={shimmer} />
        </View>
        <Ph style={styles.pillBar} shimmer={shimmer} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.hRow}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.suggestCard}>
            <View style={styles.suggestCardTop}>
              <Ph style={styles.thumb44} shimmer={shimmer} />
              <View style={styles.suggestMid}>
                <Ph style={styles.lineName} shimmer={shimmer} />
                <Ph style={styles.lineSym} shimmer={shimmer} />
              </View>
              <Ph style={styles.chevSm} shimmer={shimmer} />
            </View>
            <Ph style={styles.priceLine} shimmer={shimmer} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.tipsBlock}>
        <View style={styles.tipsHeaderRow}>
          <Ph style={styles.headerIcon} shimmer={shimmer} />
          <Ph style={styles.tipsTitleBar} shimmer={shimmer} />
        </View>
        {[0, 1].map((i) => (
          <View key={i} style={styles.tipRow}>
            <Ph style={styles.tipIcon} shimmer={shimmer} />
            <Ph style={styles.tipLine} shimmer={shimmer} />
            <Ph style={styles.chevMd} shimmer={shimmer} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootPad: {
    paddingBottom: spacing.xl,
  },
  screenTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.base,
    color: colors.primary,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    fontWeight: "800",
  },
  phBase: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.sm,
  },
  heroCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: spacing.xl,
    ...cardShadow,
  },
  heroRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.base,
  },
  heroTitleBar: {
    height: 20,
    width: "70%",
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  heroCtaBar: {
    height: 48,
    width: "100%",
    borderRadius: radii.lg,
  },
  sectionTop: {
    marginBottom: spacing.sm,
  },
  suggestHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  suggestTitleBar: {
    flex: 1,
    height: 22,
    maxWidth: 220,
    borderRadius: radii.sm,
  },
  pillBar: {
    alignSelf: "flex-start",
    height: 28,
    width: 160,
    borderRadius: radii.full,
  },
  hRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.base,
    paddingRight: spacing.lg,
  },
  suggestCard: {
    width: SUGGEST_CARD_W,
    minHeight: SUGGEST_CARD_MIN_H,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...cardShadow,
  },
  suggestCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  thumb44: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  suggestMid: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  lineName: {
    height: 16,
    width: "85%",
  },
  lineSym: {
    height: 12,
    width: "45%",
  },
  chevSm: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  priceLine: {
    height: 20,
    width: "55%",
    alignSelf: "flex-end",
  },
  tipsBlock: {
    alignSelf: "stretch",
    marginTop: spacing.md,
  },
  tipsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsTitleBar: {
    flex: 1,
    height: 22,
    maxWidth: 180,
    borderRadius: radii.sm,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...cardShadow,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tipLine: {
    flex: 1,
    height: 16,
    maxWidth: 200,
  },
  chevMd: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  footerStack: {
    gap: 0,
    paddingBottom: spacing.xxl,
  },
});
