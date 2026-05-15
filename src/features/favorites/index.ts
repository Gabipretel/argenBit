/** Entrada pública del módulo Favoritos — importar desde `@/features/favorites`. */

export {
  FavoritesEmptyStateSkeleton,
  FavoritesFooterOnlySkeleton,
  FavoritesListInitialSkeleton,
} from "./components/FavoritesLayoutSkeleton";

export { FavoritesProvider, useFavorites } from "./FavoritesContext";
export { useFavoriteAssetsQuery } from "./hooks/useFavoriteAssetsQuery";
export type { FavoriteEntry } from "@/storage/favoritesStorage";

export { FavoritesScreen } from "./screen/FavoritesScreen";
