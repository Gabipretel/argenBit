import { StyleSheet, Text, View } from "react-native";

import { ExpoNotificationsHintBanner } from "./ExpoNotificationsHintBanner";
import { colors, spacing, typography } from "@/core/theme";

export function AlertsListHeader() {
  return (
    <View style={styles.listHeader}>
      <ExpoNotificationsHintBanner />
      <Text style={styles.screenTitle}>Mis alertas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    marginBottom: spacing.xs,
  },
  screenTitle: {
    ...typography.headlineMd,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    fontWeight: "800",
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
