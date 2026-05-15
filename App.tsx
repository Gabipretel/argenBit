import { QueryClientProvider } from "@tanstack/react-query";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "react-error-boundary";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import {
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from "@react-navigation/native";

import { AlertLifecycle, AppErrorFallback, useAppFonts } from "@/common";
import { FavoritesProvider } from "@/features/favorites";
import "@/core/config/dayjsLocale";
import { queryClient } from "@/core/config/queryClient";
import { AppNavigator } from "@/core/navigation/AppNavigator";
import { store } from "@/core/store";
import { colors } from "@/core/theme/colors";
import { setBrandTypographyActive } from "@/core/theme/typography";

const navigationTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.onSurface,
    border: colors.outlineVariant,
    primary: colors.primary,
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();
  const fontsReady = fontsLoaded || fontError !== null;

  if (fontsReady) {
    setBrandTypographyActive(Boolean(fontsLoaded && !fontError));
  }

  useEffect(() => {
    if (!fontsReady) return;
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [fontsReady]);

  if (!fontsReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <FavoritesProvider>
              <AlertLifecycle />
              <ErrorBoundary FallbackComponent={AppErrorFallback}>
                <NavigationContainer theme={navigationTheme}>
                  <AppNavigator />
                </NavigationContainer>
              </ErrorBoundary>
              <StatusBar style="dark" />
            </FavoritesProvider>
          </QueryClientProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
