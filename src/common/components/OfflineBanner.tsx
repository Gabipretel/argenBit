import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNetworkStatus } from "@/common/hooks/useNetworkStatus";
import { colors, spacing, typography } from "@/core/theme";

/** Alto del contenido del banner (sin contar safe area superior). */
export const OFFLINE_BANNER_CONTENT_HEIGHT = 56;

export function useOfflineBannerInset(): number {
  const { isOffline } = useNetworkStatus();
  return isOffline ? OFFLINE_BANNER_CONTENT_HEIGHT : 0;
}

/**
 * Banner global sin conexión: overlay bajo la status bar, no empuja el navigator.
 * Las pantallas con `AppTopBar` usan `useOfflineBannerInset()` para dejar espacio.
 */
export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          top: insets.top,
          minHeight: OFFLINE_BANNER_CONTENT_HEIGHT,
        },
      ]}
      pointerEvents="box-none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <MaterialCommunityIcons name="wifi-off" size={20} color={colors.onPrimary} />
      <View style={styles.textCol}>
        <Text style={styles.title}>Sin conexión a internet</Text>
        <Text style={styles.message}>
          Los datos se actualizarán automáticamente apenas recuperes la señal.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.error,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  message: {
    ...typography.caption,
    color: colors.onPrimary,
    marginTop: 2,
    opacity: 0.92,
  },
});
