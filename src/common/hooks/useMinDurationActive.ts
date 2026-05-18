import { useLayoutEffect, useRef, useState } from "react";

/**
 * Garantiza que un indicador de carga se muestre al menos `minMs`,
 * aunque `active` se apague antes (p. ej. datos desde caché).
 */

export function useMinDurationActive(active: boolean, minMs: number): boolean {
  const [out, setOut] = useState(false);
  const sessionStartRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (active) {
      sessionStartRef.current = Date.now();
      setOut(true);
      return;
    }

    const started = sessionStartRef.current;
    sessionStartRef.current = null;

    if (started == null) {
      setOut(false);
      return;
    }

    const elapsed = Date.now() - started;
    const remaining = Math.max(0, minMs - elapsed);
    const id = setTimeout(() => setOut(false), remaining);
    return () => clearTimeout(id);
  }, [active, minMs]);

  return out;
}
