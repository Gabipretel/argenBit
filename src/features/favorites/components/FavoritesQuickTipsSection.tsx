import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

interface FavoritesQuickTipsSectionProps {
  onGoToMarketsPress: () => void;
  onGoToAlertsPress: () => void;
}

export function FavoritesQuickTipsSection({
  onGoToMarketsPress,
  onGoToAlertsPress,
}: FavoritesQuickTipsSectionProps) {
  return (
    <View style={styles.tipsSection}>
      <View style={styles.tipsHeaderRow}>
        <MaterialCommunityIcons name="lightning-bolt-outline" size={22} color={colors.primary} />
        <Text style={styles.tipsSectionTitle}>Seguí el ritmo</Text>
      </View>
      <Pressable
        onPress={onGoToAlertsPress}
        style={({ pressed }) => [styles.tipRow, pressed && styles.tipRowPressed]}
        accessibilityRole="button"
        accessibilityLabel="Ir a alertas de precio"
      >
        <View style={styles.tipIconWrap}>
          <MaterialCommunityIcons name="bell-ring-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.tipTextCol}>
          <Text style={styles.tipRowTitle}>Alertas de precio</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.outline} />
      </Pressable>
      <Pressable
        onPress={onGoToMarketsPress}
        style={({ pressed }) => [styles.tipRow, pressed && styles.tipRowPressed]}
        accessibilityRole="button"
        accessibilityLabel="Ir a mercados"
      >
        <View style={styles.tipIconWrap}>
          <MaterialCommunityIcons name="store-search-outline" size={22} color={colors.success} />
        </View>
        <View style={styles.tipTextCol}>
          <Text style={styles.tipRowTitle}>Mercados y filtros</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.outline} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tipsSection: {
    alignSelf: "stretch",
  },
  tipsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsSectionTitle: {
    ...typography.headlineMd,
    flex: 1,
    fontSize: 20,
    lineHeight: 26,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...cardShadow,
  },
  tipRowPressed: {
    opacity: 0.94,
    borderColor: colors.primary,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tipTextCol: {
    flex: 1,
    minWidth: 0,
  },
  tipRowTitle: {
    ...typography.labelMd,
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
  },
});
