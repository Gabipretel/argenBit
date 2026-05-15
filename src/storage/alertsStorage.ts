import AsyncStorage from "@react-native-async-storage/async-storage";

export const ALERTS_STORAGE_KEY = "argenbit-alerts";

export type AlertKind =
  | "price_above"
  | "price_below"
  | "pct_up"
  | "pct_down";

export interface StoredAlert {
  id: string;
  fsym: string;
  kind: AlertKind;
  threshold: number;
  recurring: boolean;
}

export async function readAlerts(): Promise<StoredAlert[]> {
  const raw = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredAlert[]) : [];
  } catch {
    return [];
  }
}

export async function writeAlerts(alerts: StoredAlert[]): Promise<void> {
  await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
}
