import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, toolbarPanelShadow, typography } from "@/theme";

type NewsListHeaderProps = {
  /** Si es false (p. ej. skeleton de carga), solo se muestra el título; el panel aparece al terminar de cargar. */
  showChipPanel?: boolean;
};

export function NewsListHeader({ showChipPanel = true }: NewsListHeaderProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.newsScreenTitle}>Pulso del mercado</Text>
      {showChipPanel ? (
        <View style={styles.newsPanel}>
          <View style={styles.newsPanelRow}>
            <View style={styles.newsIconWrap}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.newsPill}>
              <Text style={styles.newsPillTxt}>Titulares cripto</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  newsScreenTitle: {
    ...typography.headlineMd,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  newsPanel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...toolbarPanelShadow,
  },
  newsPanelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  newsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(35, 99, 145, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(35, 99, 145, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  newsPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: "rgba(35, 99, 145, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(35, 99, 145, 0.35)",
  },
  newsPillTxt: {
    ...typography.caption,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.primary,
    textTransform: "uppercase",
  },
});
