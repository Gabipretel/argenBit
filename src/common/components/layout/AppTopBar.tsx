import type { ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useOfflineBannerInset } from "@/common/components/OfflineBanner";
import { colors, spacing, typography } from "@/core/theme";

interface AppTopBarProps {
  trailing?: ReactNode;
}

export function AppTopBar({ trailing }: AppTopBarProps) {
  const offlineBannerInset = useOfflineBannerInset();

  return (
    <View style={[styles.row, offlineBannerInset > 0 && { marginTop: offlineBannerInset }]}>
      <View style={styles.side} />
      <Text style={styles.title}>
        <Text style={styles.argen}>argen</Text>
        <Text style={styles.bit}>Bit</Text>
      </Text>
      <View style={[styles.side, styles.sideRight]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  argen: {
    ...typography.headlineLg,
    fontSize: 22,
    lineHeight: 28,
    color: colors.primary,
    letterSpacing: -0.35,
  },
  bit: {
    ...typography.headlineLg,
    fontSize: 22,
    lineHeight: 28,
    color: colors.secondary,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  side: {
    width: 44,
    minHeight: 28,
  },
  sideRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
