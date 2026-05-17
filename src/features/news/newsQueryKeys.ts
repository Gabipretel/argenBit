/** Claves de React Query del feed de noticias (sin cargar pantallas del feature). */

export const NEWS_PAGE_SIZE = 15;

export const newsInfiniteQueryKey = ["news", { limit: NEWS_PAGE_SIZE }] as const;
