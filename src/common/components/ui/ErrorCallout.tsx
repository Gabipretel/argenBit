import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/core/theme";

interface ErrorCalloutProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Bloque consistente para estados de error (lista, fetch, etc.).
 */
export function ErrorCallout({
  title,
  message,
  onRetry,
  retryLabel = "Reintentar",
}: ErrorCalloutProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="cloud-alert-outline" size={40} color={colors.primary} />
      </View>
      <Text style={[typography.headlineMd, styles.title]}>{title}</Text>
      <Text style={[typography.bodyMd, styles.message]}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
          <MaterialCommunityIcons name="refresh" size={20} color={colors.onPrimary} />
          <Text style={styles.btnTxt}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.primaryFixed,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  title: {
    textAlign: "center",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: "center",
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
  },
  btnPressed: {
    opacity: 0.92,
  },
  btnTxt: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
});
