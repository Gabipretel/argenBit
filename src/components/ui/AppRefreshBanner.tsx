import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { cardShadow, colors, radii, spacing, typography } from "@/theme";

interface AppRefreshBannerProps {
  visible: boolean;
  title: string;
  message?: string;
}

/**
 * Mensaje visible al refrescar (pull-to-refresh), unificado en la app.
 * Complementa el indicador nativo con título y texto amigable.
 */
export function AppRefreshBanner({ visible, title, message }: AppRefreshBannerProps) {
  if (!visible) return null;

  return (
    <View
      style={styles.wrap}
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
      accessibilityLabel={[title, message].filter(Boolean).join(". ")}
    >
      <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...cardShadow,
  },
  spinner: {
    marginLeft: spacing.xs,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },
  message: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
});
