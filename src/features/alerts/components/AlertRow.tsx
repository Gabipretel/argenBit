import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ALERT_ACCENT_COLOR,
  ALERT_ICON_NAME,
  ALERT_KIND_CARD_SUMMARY,
  getAlertKindTitle,
} from "../constants/alertUiConstants";
import type { StoredAlert } from "@/storage/alertsStorage";
import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

interface AlertRowProps {
  alert: StoredAlert;
  onRemovePress: (alertId: string) => void;
  onReactivatePress: (alertId: string) => void;
}

export const AlertRow = memo(function AlertRow({
  alert,
  onRemovePress,
  onReactivatePress,
}: AlertRowProps) {
  const accentColor = ALERT_ACCENT_COLOR[alert.kind];
  const isPercentAlert = alert.kind === "pct_up" || alert.kind === "pct_down";
  const isNotified = alert.status === "notified";

  return (
    <View style={[styles.alertCard, isNotified && styles.alertCardNotified]}>
      <View
        style={[
          styles.alertAccentTop,
          { backgroundColor: accentColor },
          isNotified && styles.alertAccentMuted,
        ]}
      />
      <View style={styles.alertCardInner}>
        <View style={[styles.alertIconWrap, { borderColor: accentColor }]}>
          <MaterialCommunityIcons
            name={ALERT_ICON_NAME[alert.kind] as never}
            size={20}
            color={accentColor}
          />
        </View>
        <View style={styles.alertCol}>
          <View style={styles.alertTopLine}>
            <Text style={styles.alertSym}>{alert.fsym}</Text>
            <Pressable
              onPress={() => onRemovePress(alert.id)}
              hitSlop={10}
              accessibilityLabel="Eliminar alerta"
              style={({ pressed }) => [styles.alertTrash, pressed && styles.alertTrashPressed]}
            >
              <MaterialCommunityIcons name="delete-outline" size={22} color={colors.error} />
            </Pressable>
          </View>
          <Text style={[styles.alertKind, { color: accentColor }]}>{getAlertKindTitle(alert.kind)}</Text>
          <Text style={[styles.alertCond, isNotified && styles.alertCondMuted]}>
            {ALERT_KIND_CARD_SUMMARY[alert.kind]}{" "}
            <Text style={styles.alertCondStrong}>
              {alert.threshold}
              {isPercentAlert ? "%" : " USD"}
            </Text>
          </Text>
          {isNotified ? (
            <View style={styles.alertFooter}>
              <View style={styles.notifiedChip}>
                <MaterialCommunityIcons
                  name="bell-check-outline"
                  size={14}
                  color={colors.secondary}
                />
                <Text style={styles.notifiedChipTxt}>Notificada</Text>
              </View>
              <Pressable
                onPress={() => onReactivatePress(alert.id)}
                accessibilityLabel="Activar de nuevo"
                style={({ pressed }) => [
                  styles.reactivateBtn,
                  pressed && styles.reactivateBtnPressed,
                ]}
              >
                <MaterialCommunityIcons name="bell-ring-outline" size={16} color={colors.primary} />
                <Text style={styles.reactivateBtnTxt}>Activar de nuevo</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}, isSameAlertRowProps);

function isSameAlertRowProps(previous: AlertRowProps, next: AlertRowProps): boolean {
  const previousAlert = previous.alert;
  const nextAlert = next.alert;
  return (
    previous.onRemovePress === next.onRemovePress &&
    previous.onReactivatePress === next.onReactivatePress &&
    previousAlert.id === nextAlert.id &&
    previousAlert.fsym === nextAlert.fsym &&
    previousAlert.kind === nextAlert.kind &&
    previousAlert.threshold === nextAlert.threshold &&
    previousAlert.status === nextAlert.status
  );
}

const styles = StyleSheet.create({
  alertCard: {
    marginBottom: spacing.base,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: "hidden",
    ...cardShadow,
  },
  alertCardNotified: {
    backgroundColor: colors.surfaceContainerLow,
  },
  alertAccentTop: {
    height: 3,
    width: "100%",
  },
  alertAccentMuted: {
    opacity: 0.45,
  },
  alertCardInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1.5,
    backgroundColor: colors.surfaceBright,
    alignItems: "center",
    justifyContent: "center",
  },
  alertCol: {
    flex: 1,
    minWidth: 0,
  },
  alertTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: 2,
  },
  alertSym: {
    ...typography.headlineMd,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.3,
    flex: 1,
  },
  alertKind: {
    ...typography.labelMd,
    fontWeight: "700",
    marginBottom: 2,
  },
  alertCond: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
  },
  alertCondStrong: {
    color: colors.onSurface,
    fontWeight: "700",
  },
  alertCondMuted: {
    color: colors.onSurfaceVariant,
  },
  alertFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  notifiedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(123, 88, 0, 0.35)",
    backgroundColor: "rgba(123, 88, 0, 0.08)",
  },
  notifiedChipTxt: {
    ...typography.caption,
    fontWeight: "700",
    fontSize: 11,
    color: colors.secondary,
  },
  reactivateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(35, 99, 145, 0.45)",
    backgroundColor: "rgba(35, 99, 145, 0.08)",
  },
  reactivateBtnPressed: {
    opacity: 0.9,
    backgroundColor: "rgba(35, 99, 145, 0.16)",
  },
  reactivateBtnTxt: {
    ...typography.caption,
    fontWeight: "700",
    fontSize: 11,
    color: colors.primary,
  },
  alertTrash: {
    padding: spacing.xs,
    borderRadius: radii.md,
  },
  alertTrashPressed: {
    backgroundColor: colors.errorContainer,
    opacity: 0.95,
  },
});
