import { useEffect } from "react";
import type { FallbackProps } from "react-error-boundary";
import { StyleSheet, View } from "react-native";

import { ErrorCallout } from "./ui/ErrorCallout";
import { colors, spacing } from "@/core/theme";

const TITLE = "Algo salió mal";
const MESSAGE = "Volvé a intentarlo más tarde.";

export function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    if (__DEV__) {
      // Solo consola en desarrollo; nunca mostramos el detalle técnico en pantalla.
      console.warn("[ErrorBoundary]", error);
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <ErrorCallout title={TITLE} message={MESSAGE} onRetry={resetErrorBoundary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
});
