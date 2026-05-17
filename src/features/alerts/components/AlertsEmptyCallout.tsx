import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, toolbarPanelShadow, typography } from "@/core/theme";

interface AlertsEmptyCalloutProps {
  onCreateAlertPress: () => void;
}

export function AlertsEmptyCallout({ onCreateAlertPress }: AlertsEmptyCalloutProps) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconCircle}>
        <MaterialCommunityIcons name="bell-plus-outline" size={40} color={colors.primary} />
      </View>
      <Text style={[typography.headlineMd, styles.emptyTitle]}>Todavía no tenés alertas</Text>
      <Text style={[typography.bodyMd, styles.emptyBody]}>
        Creá avisos de precio o de variación del día. También podés usar el botón{" "}
        <Text style={styles.emptyPlus}>+</Text> arriba a la derecha.
      </Text>
      <Text style={[typography.caption, styles.emptyFoot]}>
        Tus alertas se guardan solo en este dispositivo. Te avisamos mientras usás la app o cuando la volvés a abrir.
      </Text>
      <Pressable
        onPress={onCreateAlertPress}
        style={({ pressed }) => [styles.emptyCta, pressed && styles.emptyCtaPressed]}
      >
        <MaterialCommunityIcons name="bell-plus-outline" size={22} color={colors.onPrimary} />
        <Text style={styles.emptyCtaTxt}>Nueva alerta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...toolbarPanelShadow,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  emptyTitle: {
    ...typography.headlineMd,
    textAlign: "center",
    color: colors.onSurface,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },
  emptyBody: {
    ...typography.bodyMd,
    textAlign: "center",
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  emptyPlus: {
    fontWeight: "800",
    color: colors.primary,
  },
  emptyFoot: {
    ...typography.caption,
    textAlign: "center",
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  emptyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    alignSelf: "stretch",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  emptyCtaPressed: {
    opacity: 0.92,
  },
  emptyCtaTxt: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
});
