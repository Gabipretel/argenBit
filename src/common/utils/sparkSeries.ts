/** Serie 0–1 determinística por activo (lista Mercados y detalle; no es histórico real). */
export function buildSparkSeries(fsym: string, changePct: number, len = 16): number[] {
  let h = 2166136261 >>> 0;
  const s = fsym.toUpperCase();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rnd = (i: number) => {
    h ^= (i + len * 997) >>> 0;
    h = Math.imul(h, 16777619);
    return (h >>> 0) / 0xffffffff;
  };
  const slope = Math.max(-1, Math.min(1, changePct / 12));
  return Array.from({ length: len }, (_, i) => {
    const t = i / Math.max(1, len - 1);
    const wave = (rnd(i) - 0.5) * 0.22;
    let v = 0.52 + slope * (t - 0.48) + wave;
    return Math.max(0.06, Math.min(0.94, v));
  });
}
