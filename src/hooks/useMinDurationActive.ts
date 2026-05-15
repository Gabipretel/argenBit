import { useLayoutEffect, useRef, useState } from "react";

/**
 * Mantiene la señal en `true` al menos `minMs` desde que `active` pasó a `true`,
 * aunque `active` vuelva a `false` antes (p. ej. respuesta desde caché muy rápida).
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
