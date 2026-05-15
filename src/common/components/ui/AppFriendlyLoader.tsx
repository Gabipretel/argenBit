import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/core/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

interface AppFriendlyLoaderProps {
  title: string;
  message?: string;
  /** Icono MaterialCommunityIcons encima del título. */
  icon?: IconName;
}

/**
 * Estado de carga centrado reutilizable (pantallas iniciales, etc.).
 * El título y el mensaje cambian según el contexto donde se use.
 */
export function AppFriendlyLoader({
  title,
  message,
  icon = "cloud-download-outline",
}: AppFriendlyLoaderProps) {
  return (
    <View style={styles.root} accessibilityRole="progressbar" accessibilityLabel={title}>
      <View style={styles.iconRing}>
        <MaterialCommunityIcons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={[typography.headlineMd, styles.title]}>{title}</Text>
      {message ? (
        <Text style={[typography.bodyMd, styles.message]}>{message}</Text>
      ) : null}
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryFixed,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: "center",
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: "center",
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  spinner: {
    marginTop: spacing.xs,
  },
});
