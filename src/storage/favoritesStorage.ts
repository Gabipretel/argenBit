import AsyncStorage from "@react-native-async-storage/async-storage";

export const FAVORITES_STORAGE_KEY = "argenbit-favorites";

export async function readFavoriteFsyms(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .map((s) => s.toUpperCase());
  } catch {
    return [];
  }
}

export async function writeFavoriteFsyms(fsyms: string[]): Promise<void> {
  const unique = [...new Set(fsyms.map((s) => s.toUpperCase()))];
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(unique));
}
