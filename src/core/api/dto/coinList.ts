/** Respuesta paginada `GET /coins` (CoinStats). */
export interface CoinListPageMetaDto {
  page: number;
  limit: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CoinListItemDto {
  id: string;
  icon: string;
  name: string;
  symbol: string;
  rank: number;
  price: number;
  volume: number;
  marketCap: number;
  priceChange1d: number;
  availableSupply?: number;
  totalSupply?: number;
  /** 0–100 con `includeRiskScore=true` en `GET /coins`. */
  riskScore?: number;
  volatilityScore?: number;
  liquidityScore?: number;
}

export interface CoinListResponseDto {
  meta: CoinListPageMetaDto;
  result: CoinListItemDto[];
}

export type CoinChartPointDto = [number, number, number, number];
