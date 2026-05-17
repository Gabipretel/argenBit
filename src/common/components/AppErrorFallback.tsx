import { useEffect } from "react";
import type { FallbackProps } from "react-error-boundary";
import { StyleSheet, View } from "react-native";

import { ErrorCallout } from "./ui/ErrorCallout";
import { colors, spacing } from "@/core/theme";


export function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    if (__DEV__) {
      console.warn("[Error detectado en la aplicación : ]", error);
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <ErrorCallout title={"Algo salió mal"} message={"Volvé a intentarlo más tarde."} onRetry={resetErrorBoundary} />
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
