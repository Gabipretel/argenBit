/** Respuesta de la API `GET /coins`, `GET /coins/:id` (CoinStats). */
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
  priceChange1h?: number;
  priceChange1d: number;
  priceChange1w?: number;
  priceChange1m?: number;
  availableSupply?: number;
  totalSupply?: number;
  riskScore?: number;
  volatilityScore?: number;
  liquidityScore?: number;
}

export interface CoinListResponseDto {
  meta?: CoinListPageMetaDto;
  result: CoinListItemDto[];
}

