import AsyncStorage from "@react-native-async-storage/async-storage";

export const FAVORITES_STORAGE_KEY = "argenbit-favorites";

export type FavoriteEntry = {
  coinId: string;
  fsym: string;
};

function isLegacyStringArray(parsed: unknown): parsed is string[] {
  return (
    Array.isArray(parsed) &&
    parsed.length > 0 &&
    parsed.every((x) => typeof x === "string" && x.length > 0)
  );
}

function isFavoriteEntryArray(parsed: unknown): parsed is FavoriteEntry[] {
  return (
    Array.isArray(parsed) &&
    parsed.every(
      (x) =>
        x &&
        typeof x === "object" &&
        typeof (x as FavoriteEntry).coinId === "string" &&
        typeof (x as FavoriteEntry).fsym === "string"
    )
  );
}

export async function readFavoriteEntries(): Promise<FavoriteEntry[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isFavoriteEntryArray(parsed)) {
      return parsed.map((e) => ({
        coinId: e.coinId.trim(),
        fsym: e.fsym.trim().toUpperCase(),
      }));
    }
    if (isLegacyStringArray(parsed)) {
      return parsed.map((s) => ({
        fsym: s.trim().toUpperCase(),
        coinId: "",
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function writeFavoriteEntries(entries: FavoriteEntry[]): Promise<void> {
  const unique = new Map<string, FavoriteEntry>();
  for (const e of entries) {
    const fsym = e.fsym.trim().toUpperCase();
    const coinId = e.coinId.trim();
    if (!fsym || !coinId) continue;
    unique.set(fsym, { coinId, fsym });
  }
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...unique.values()]));
}

