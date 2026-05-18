import AsyncStorage from "@react-native-async-storage/async-storage";

export const ALERTS_STORAGE_KEY = "argenbit-alerts";

export type AlertKind =
  | "price_above"
  | "price_below"
  | "pct_up"
  | "pct_down";

export type AlertStatus = "active" | "notified";

export interface StoredAlert {
  id: string;
  fsym: string;
  kind: AlertKind;
  threshold: number;
  status: AlertStatus;
}

export async function readAlerts(): Promise<StoredAlert[]> {
  const raw = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is Record<string, unknown> => row !== null && typeof row === "object")
      .map(normalizeStoredAlert)
      .filter((row): row is StoredAlert => row !== null);
  } catch {
    return [];
  }
}

function normalizeStoredAlert(row: Record<string, unknown>): StoredAlert | null {
  const id = typeof row.id === "string" ? row.id : "";
  const fsym = typeof row.fsym === "string" ? row.fsym : "";
  const kind = row.kind;
  const threshold = typeof row.threshold === "number" ? row.threshold : Number(row.threshold);
  if (!id || !fsym || !Number.isFinite(threshold)) return null;
  if (
    kind !== "price_above" &&
    kind !== "price_below" &&
    kind !== "pct_up" &&
    kind !== "pct_down"
  ) {
    return null;
  }
  const status = normalizeAlertStatus(row.status);
  return { id, fsym, kind, threshold, status };
}

function normalizeAlertStatus(raw: unknown): AlertStatus {
  if (raw === "notified" || raw === "triggered") return "notified";
  return "active";
}

export async function writeAlerts(alerts: StoredAlert[]): Promise<void> {
  await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
}
