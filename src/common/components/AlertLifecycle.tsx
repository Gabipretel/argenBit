import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState, Platform } from "react-native";

import { runAllAlertsEvaluation } from "@/features/alerts/runAlertEvaluation";
import { shouldLoadExpoNotifications } from "@/core/config/expoRuntime";

/**
 * §7.7 — al volver a foreground se reevalúan reglas contra la caché actual.
 * `expo-notifications` no se importa en Expo Go (SDK 53+ Android): usa development build para push/locales ahí.
 */
export function AlertLifecycle() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!shouldLoadExpoNotifications()) return;

    let cancelled = false;
    void import("expo-notifications").then((Notifications) => {
      if (cancelled) return;
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void runAllAlertsEvaluation(queryClient);
  }, [queryClient]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        void runAllAlertsEvaluation(queryClient);
      }
    });
    return () => sub.remove();
  }, [queryClient]);

  return null;
}
