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
}

export const AlertRow = memo(function AlertRow({ alert, onRemovePress }: AlertRowProps) {
  const accentColor = ALERT_ACCENT_COLOR[alert.kind];
  const isPercentAlert = alert.kind === "pct_up" || alert.kind === "pct_down";

  return (
    <View style={styles.alertCard}>
      <View style={[styles.alertAccentTop, { backgroundColor: accentColor }]} />
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
          <Text style={styles.alertCond}>
            {ALERT_KIND_CARD_SUMMARY[alert.kind]}{" "}
            <Text style={styles.alertCondStrong}>
              {alert.threshold}
              {isPercentAlert ? "%" : " USD"}
            </Text>
          </Text>
          <View
            style={[
              styles.alertRecChip,
              alert.recurring ? styles.alertRecChipRecurring : styles.alertRecChipOnce,
            ]}
          >
            <MaterialCommunityIcons
              name={alert.recurring ? "repeat" : "numeric-1-circle-outline"}
              size={14}
              color={alert.recurring ? colors.primary : colors.secondary}
            />
            <Text
              style={[
                styles.alertRecTxt,
                alert.recurring ? styles.alertRecTxtRecurring : styles.alertRecTxtOnce,
              ]}
            >
              {alert.recurring ? "Cada vez" : "Una vez"}
            </Text>
          </View>
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
    previousAlert.id === nextAlert.id &&
    previousAlert.fsym === nextAlert.fsym &&
    previousAlert.kind === nextAlert.kind &&
    previousAlert.threshold === nextAlert.threshold &&
    previousAlert.recurring === nextAlert.recurring
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
  alertAccentTop: {
    height: 3,
    width: "100%",
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
  alertRecChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: spacing.sm,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  alertRecChipRecurring: {
    backgroundColor: "rgba(35, 99, 145, 0.1)",
    borderColor: "rgba(35, 99, 145, 0.35)",
  },
  alertRecChipOnce: {
    backgroundColor: "rgba(123, 88, 0, 0.08)",
    borderColor: "rgba(123, 88, 0, 0.35)",
  },
  alertRecTxt: {
    ...typography.caption,
    fontWeight: "700",
    fontSize: 11,
  },
  alertRecTxtRecurring: {
    color: colors.primary,
  },
  alertRecTxtOnce: {
    color: colors.secondary,
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
