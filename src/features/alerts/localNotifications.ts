import { Platform } from "react-native";

import { shouldLoadExpoNotifications } from "@/core/config/expoRuntime";
import type { StoredAlert } from "@/storage/alertsStorage";
import type { PriceMetrics } from "./alertConditions";

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

/** Título y cuerpo legibles para la notificación local (sin símbolos ≤ / ≥). */
export function buildAlertNotificationContent(
  alert: StoredAlert,
  metrics: PriceMetrics
): { title: string; body: string } {
  const sym = alert.fsym.trim().toUpperCase();
  const price = formatUsd(metrics.priceUsd);
  const target = formatUsd(alert.threshold);
  const pct = metrics.changePercent24Hr;

  switch (alert.kind) {
    case "price_below":
      return {
        title: `${sym}: bajó de tu precio`,
        body: `Está en ${price}. Tu alerta era por debajo de ${target}.`,
      };
    case "price_above":
      return {
        title: `${sym}: subió de tu precio`,
        body: `Ahora vale ${price}. Configuraste aviso por encima de ${target}.`,
      };
    case "pct_up":
      return {
        title: `${sym}: subida en 24 h`,
        body: `Variación ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%. Pediste aviso si superaba ${alert.threshold}%.`,
      };
    case "pct_down":
      return {
        title: `${sym}: caída en 24 h`,
        body: `Variación ${pct.toFixed(2)}%. Pediste aviso si caía más de ${Math.abs(alert.threshold)}%.`,
      };
    default:
      return { title: `Alerta · ${sym}`, body: "Se cumplió una condición que configuraste." };
  }
}

/**
 * Notificación local casi inmediata — §7.7 (opcional).
 * En Expo Go no hay módulo nativo: no hace nada.
 */
export async function presentAlertTriggeredNotification(
  alert: StoredAlert,
  metrics: PriceMetrics
): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  await ensureAndroidAlertChannel();
  const ok = await ensureNotificationPermissions();
  if (!ok) return false;

  const { title, body } = buildAlertNotificationContent(alert, metrics);

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: `alert-${alert.id}-${Date.now()}`,
      content: {
        title,
        body,
        sound: "default",
      },
      trigger: null,
    });
    return true;
  } catch {
    return false;
  }
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
