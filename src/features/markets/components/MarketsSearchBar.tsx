import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { cardShadow, colors, radii, spacing, typography } from "@/core/theme";

type MarketsSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function MarketsSearchBar({ value, onChangeText }: MarketsSearchBarProps) {
  const showClear = value.length > 0;

  return (
    <View style={styles.wrap}>
      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color={colors.primary}
        style={styles.leadingIcon}
      />
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o símbolo"
        placeholderTextColor={colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
      />
      <View style={styles.trailingSlot}>
        {showClear ? (
          <Pressable
            onPress={() => onChangeText("")}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
            style={({ pressed }) => [styles.clearBtn, pressed && styles.clearBtnPressed]}
          >
            <MaterialCommunityIcons name="close" size={18} color={colors.onSurface} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const TRAILING_SLOT_W = 36;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    backgroundColor: colors.surfaceContainerLowest,
    ...cardShadow,
  },
  leadingIcon: {
    marginRight: spacing.xs,
  },
  input: {
    ...typography.bodyMd,
    flex: 1,
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingRight: spacing.xs,
    color: colors.onSurface,
  },
  trailingSlot: {
    width: TRAILING_SLOT_W,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerHigh,
  },
  clearBtnPressed: {
    opacity: 0.85,
  },
});
