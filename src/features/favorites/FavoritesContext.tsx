import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  readFavoriteEntries,
  writeFavoriteEntries,
  type FavoriteEntry,
} from "@/storage/favoritesStorage";

type FavoritesContextValue = {
  entries: FavoriteEntry[];
  /** Lista de símbolos en mayúsculas (compatibilidad). */
  fsyms: string[];
  ready: boolean;
  toggle: (entry: FavoriteEntry) => void;
  isFavorite: (fsym: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    readFavoriteEntries().then((rows) => {
      if (alive) {
        setEntries(rows);
        setReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const toggle = useCallback((entry: FavoriteEntry) => {
    const fsym = entry.fsym.trim().toUpperCase();
    const coinId = entry.coinId.trim();
    if (!fsym) return;
    setEntries((prev) => {
      const exists = prev.some((x) => x.fsym === fsym);
      const next = exists
        ? prev.filter((x) => x.fsym !== fsym)
        : [...prev, { fsym, coinId }];
      void writeFavoriteEntries(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (fsym: string) =>
      entries.some((e) => e.fsym === fsym.trim().toUpperCase()),
    [entries]
  );

  const fsyms = useMemo(() => entries.map((e) => e.fsym), [entries]);

  const value = useMemo(
    () => ({ entries, fsyms, ready, toggle, isFavorite }),
    [entries, fsyms, ready, toggle, isFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return ctx;
}
