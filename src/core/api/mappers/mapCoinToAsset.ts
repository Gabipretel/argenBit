import type { CoinListItemDto } from "@/core/api/dto/coinList";
import type { Asset } from "@/domain/models/Asset";

export function mapCoinToAsset(dto: CoinListItemDto, rankFallback: number): Asset {
  const sym = (dto.symbol || "").trim().toUpperCase() || "?";
  return {
    coinId: dto.id,
    rank: typeof dto.rank === "number" ? dto.rank : rankFallback,
    fsym: sym,
    name: dto.name?.trim() || sym,
    symbolDisplay: sym,
    priceUsd: typeof dto.price === "number" ? dto.price : 0,
    changePercent24Hr: typeof dto.priceChange1d === "number" ? dto.priceChange1d : 0,
    marketCapUsd: typeof dto.marketCap === "number" ? dto.marketCap : null,
    volume24hUsd: typeof dto.volume === "number" ? dto.volume : null,
    imageUrl: dto.icon?.trim() || null,
  };
}
