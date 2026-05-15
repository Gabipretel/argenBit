import { Platform } from "react-native";

import { shouldLoadExpoNotifications } from "@/config/expoRuntime";
import type { StoredAlert } from "@/storage/alertsStorage";
import type { PriceMetrics } from "@/alerts/alertConditions";

let channelReady = false;

async function loadNotifications() {
  if (!shouldLoadExpoNotifications()) return null;
  return import("expo-notifications");
}

export async function ensureAndroidAlertChannel(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications || Platform.OS !== "android" || channelReady) return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Alertas",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: "default",
  });
  channelReady = true;
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return Boolean(req.granted);
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 1 ? 6 : 2,
  }).format(n);
}

function describeTrigger(alert: StoredAlert, metrics: PriceMetrics): string {
  switch (alert.kind) {
    case "price_above":
      return `Precio ${formatUsd(metrics.priceUsd)} ≥ ${formatUsd(alert.threshold)}`;
    case "price_below":
      return `Precio ${formatUsd(metrics.priceUsd)} ≤ ${formatUsd(alert.threshold)}`;
    case "pct_up":
      return `Variación 24h ${metrics.changePercent24Hr.toFixed(2)}% ≥ ${alert.threshold}%`;
    case "pct_down":
      return `Variación 24h ${metrics.changePercent24Hr.toFixed(2)}% ≤ −${Math.abs(alert.threshold)}%`;
    default:
      return "";
  }
}

/**
 * Notificación local casi inmediata — §7.7 (opcional).
 * En Expo Go no hay módulo nativo: no hace nada.
 */
export async function presentAlertTriggeredNotification(
  alert: StoredAlert,
  metrics: PriceMetrics
): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  await ensureAndroidAlertChannel();
  const ok = await ensureNotificationPermissions();
  if (!ok) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Alerta · ${alert.fsym}`,
      body: describeTrigger(alert, metrics),
      sound: "default",
    },
    trigger: null,
  });
}

/** Dev build con módulo nativo — verificar que llega una notificación local. */
export async function scheduleTestLocalNotification(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  await ensureAndroidAlertChannel();
  const ok = await ensureNotificationPermissions();
  if (!ok) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "argenBit · prueba",
      body: "Si ves esto, las notificaciones locales están funcionando.",
      sound: "default",
    },
    trigger: null,
  });
  return true;
}
