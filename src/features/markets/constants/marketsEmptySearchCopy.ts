
export type MarketsEmptySearchCopy = {
  title: string;
  bodyWithQuery: (query: string) => string;
  bodyFallback: string;
};

export const MARKETS_EMPTY_SEARCH_COPY_VARIANTS: MarketsEmptySearchCopy[] = [
  {
    title: "No lo encontramos",
    bodyWithQuery: (q) => `No vimos activos con «${q}». Probá con otro nombre o símbolo.`,
    bodyFallback: "Probá buscando con otro nombre o símbolo.",
  },
  {
    title: "Todavía no hay resultados",
    bodyWithQuery: (q) => `«${q}» no coincide con ningún activo. Podés probar con otro término.`,
    bodyFallback: "Podés probar con otro nombre o símbolo.",
  },
  {
    title: "Nada con esa búsqueda",
    bodyWithQuery: (q) => `No hay activos que coincidan con «${q}». Probá otra palabra.`,
    bodyFallback: "Probá con otra palabra o símbolo.",
  },
  {
    title: "Por ahora, nada",
    bodyWithQuery: (q) => `Con «${q}» no hay activos en la lista. Probá buscando de otra forma.`,
    bodyFallback: "Probá buscando con otro nombre o símbolo.",
  },
  {
    title: "Sin coincidencias",
    bodyWithQuery: (q) => `No encontramos activos con «${q}». ¿Querés probar otro nombre?`,
    bodyFallback: "¿Querés probar con otro nombre o símbolo?",
  },
];

export const MARKETS_EMPTY_SEARCH_COPY_INDEX = 4;

export function marketsEmptySearchCopy(): MarketsEmptySearchCopy {
  const idx = Math.min(
    Math.max(0, MARKETS_EMPTY_SEARCH_COPY_INDEX),
    MARKETS_EMPTY_SEARCH_COPY_VARIANTS.length - 1
  );
  return MARKETS_EMPTY_SEARCH_COPY_VARIANTS[idx]!;
}
