import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/core/theme";

/** Tiempo mínimo que el footer “cargando más” permanece visible (lectura del mensaje). */
export const MIN_LIST_LOAD_MORE_VISIBLE_MS = 1_400;

/**
 * Dispara `onEndReached` cerca del final real (fracción de alto visible).
 * Valores altos (p. ej. 0.55) cargan la siguiente página antes de ver el footer.
 */
export const LIST_PAGINATION_END_THRESHOLD = 0.12;

interface AppListLoadMoreIndicatorProps {
  message: string;
}

/** Spinner + mensaje al paginar listas (noticias, mercados, etc.). */
export function AppListLoadMoreIndicator({ message }: AppListLoadMoreIndicatorProps) {
  return (
    <View
      style={styles.row}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.labelMd,
    fontSize: 15,
    lineHeight: 20,
    color: colors.primary,
    fontWeight: "700",
  },
});
