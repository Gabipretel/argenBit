import type { CoinListItemDto } from "@/core/api/dto/coinList";
import type { AssetDetail } from "@/domain/models/AssetDetail";

export function mapCoinToAssetDetail(
  dto: CoinListItemDto,
  fallbackName?: string
): AssetDetail {
  const sym = (dto.symbol || "").trim().toUpperCase() || "?";
  const avail = dto.availableSupply;
  const total = dto.totalSupply;
  return {
    coinId: dto.id,
    fsym: sym,
    name: (dto.name?.trim() || fallbackName?.trim() || sym).trim(),
    symbolDisplay: sym,
    priceUsd: typeof dto.price === "number" ? dto.price : 0,
    changePercent24Hr: typeof dto.priceChange1d === "number" ? dto.priceChange1d : 0,
    marketCapUsd: typeof dto.marketCap === "number" ? dto.marketCap : null,
    volume24hUsd: typeof dto.volume === "number" ? dto.volume : null,
    circulatingSupply: typeof avail === "number" ? avail : null,
    maxSupply: typeof total === "number" ? total : null,
    imageUrl: dto.icon?.trim() || null,
  };
}
