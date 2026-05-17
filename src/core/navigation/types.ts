import type { AssetDetailParams } from "./assetDetailParams";

export type MarketsStackParamList = {
  MarketsHome: undefined;
  AssetDetail: AssetDetailParams;
};

export type FavoritesStackParamList = {
  FavoritesHome: undefined;
  AssetDetail: AssetDetailParams;
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
