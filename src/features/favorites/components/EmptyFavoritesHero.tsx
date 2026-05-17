import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

interface EmptyFavoritesHeroProps {
  onGoToMarketsPress: () => void;
}

export function EmptyFavoritesHero({ onGoToMarketsPress }: EmptyFavoritesHeroProps) {
  return (
    <View style={styles.emptyHero}>
      <View style={styles.emptyIconRing}>
        <MaterialCommunityIcons name="bookmark-plus-outline" size={34} color={colors.primary} />
      </View>
      <Text style={[typography.headlineMd, styles.emptyTitle]}>Tu lista está vacía</Text>
      <Pressable
        onPress={onGoToMarketsPress}
        style={({ pressed }) => [styles.primaryCta, pressed && styles.primaryCtaPressed]}
      >
        <MaterialCommunityIcons name="store-search-outline" size={22} color={colors.onPrimary} />
        <Text style={styles.primaryCtaTxt}>Ir a Mercados</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyHero: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: spacing.xl,
    overflow: "hidden",
    ...cardShadow,
  },
  emptyIconRing: {
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
    textAlign: "center",
    marginBottom: spacing.lg,
    color: colors.onSurface,
  },
  primaryCta: {
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
  primaryCtaPressed: {
    opacity: 0.92,
  },
  primaryCtaTxt: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
});
