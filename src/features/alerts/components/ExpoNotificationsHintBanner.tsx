import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { shouldLoadExpoNotifications } from "@/core/config/expoRuntime";
import { colors, radii, spacing, toolbarPanelShadow, typography } from "@/core/theme";

/**
 * En Expo Go (Android SDK 53+) no hay módulo nativo de notificaciones.
 */
export function ExpoNotificationsHintBanner() {
  if (shouldLoadExpoNotifications()) return null;

  return (
    <View
      style={styles.wrap}
      accessibilityRole="alert"
      accessibilityLabel="Aviso sobre notificaciones en Expo Go"
      testID="expo-notifications-hint"
    >
      <MaterialCommunityIcons name="information-outline" size={22} color={colors.primary} />
      <Text style={styles.txt}>
        Estás en Expo Go: los avisos del sistema no están disponibles. Para probar notificaciones
        locales, instalá la app con{" "}
        <Text style={styles.mono}>pnpm run android:dev</Text> y abrila con{" "}
        <Text style={styles.mono}>pnpm run start:dev</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...toolbarPanelShadow,
  },
  txt: {
    ...typography.bodyMd,
    flex: 1,
    color: colors.onSurface,
  },
  mono: {
    ...typography.caption,
    fontFamily: "monospace",
    color: colors.primary,
    fontWeight: "600",
  },
});
