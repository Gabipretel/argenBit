/** Entrada pública del módulo Noticias — importar desde `@/features/news`. */

export { NewsListHeader } from "./components/NewsListHeader";
export { NewsRow } from "./components/NewsRow";
export {
  NewsFeedSkeleton,
  NewsRowSkeleton,
  NewsRowSkeletonList,
} from "./components/NewsRowSkeleton";

export {
  flattenNewsPages,
  newsInfiniteQueryKey,
  NEWS_PAGE_SIZE,
  useNewsInfiniteQuery,
} from "./hooks/useNewsInfiniteQuery";

export { NewsDetailScreen } from "./screen/NewsDetailScreen";
export { NewsScreen } from "./screen/NewsScreen";
