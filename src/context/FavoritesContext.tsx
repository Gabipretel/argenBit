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
  readFavoriteFsyms,
  writeFavoriteFsyms,
} from "@/storage/favoritesStorage";

type FavoritesContextValue = {
  fsyms: string[];
  ready: boolean;
  toggle: (fsym: string) => void;
  isFavorite: (fsym: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [fsyms, setFsyms] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    readFavoriteFsyms().then((ids) => {
      if (alive) {
        setFsyms(ids);
        setReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const toggle = useCallback((fsym: string) => {
    const u = fsym.trim().toUpperCase();
    if (!u) return;
    setFsyms((prev) => {
      const next = prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u];
      void writeFavoriteFsyms(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (fsym: string) => fsyms.includes(fsym.trim().toUpperCase()),
    [fsyms]
  );

  const value = useMemo(
    () => ({ fsyms, ready, toggle, isFavorite }),
    [fsyms, ready, toggle, isFavorite]
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
