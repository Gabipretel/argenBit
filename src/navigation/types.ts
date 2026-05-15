export type MarketsStackParamList = {
  MarketsHome: undefined;
  AssetDetail: { fsym: string; displayName?: string; rank?: number };
};

export type FavoritesStackParamList = {
  FavoritesHome: undefined;
  AssetDetail: { fsym: string; displayName?: string; rank?: number };
};

export type NewsStackParamList = {
  NewsHome: undefined;
  NewsDetail: { articleId: string };
};

export type AlertsStackParamList = {
  AlertsHome: undefined;
};

export type MainTabParamList = {
  Mercados: undefined;
  Favoritos: undefined;
  Noticias: undefined;
  Alertas: undefined;
};
