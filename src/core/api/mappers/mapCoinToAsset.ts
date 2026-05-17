import type { CoinListItemDto } from "@/core/api/dto/coinList";
import type { Asset } from "@/domain/models/Asset";

function mapScore0to100(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function finiteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Normaliza filas en caché React Query (p. ej. antes de `priceChange1h`). */
export function ensureAsset(asset: Asset): Asset {
  return {
    ...asset,
    priceChange1h: finiteNumber(asset.priceChange1h),
    changePercent24Hr: finiteNumber(asset.changePercent24Hr),
  };
}

export function mapCoinToAsset(dto: CoinListItemDto, rankFallback: number): Asset {
  const sym = (dto.symbol || "").trim().toUpperCase() || "?";
  return {
    coinId: dto.id,
    rank: typeof dto.rank === "number" ? dto.rank : rankFallback,
    fsym: sym,
    name: dto.name?.trim() || sym,
    symbolDisplay: sym,
    priceUsd: typeof dto.price === "number" ? dto.price : 0,
    priceChange1h: typeof dto.priceChange1h === "number" ? dto.priceChange1h : 0,
    changePercent24Hr: typeof dto.priceChange1d === "number" ? dto.priceChange1d : 0,
    marketCapUsd: typeof dto.marketCap === "number" ? dto.marketCap : null,
    volume24hUsd: typeof dto.volume === "number" ? dto.volume : null,
    circulatingSupply:
      typeof dto.availableSupply === "number" ? dto.availableSupply : null,
    riskScore: mapScore0to100(dto.riskScore),
    volatilityScore: mapScore0to100(dto.volatilityScore),
    liquidityScore: mapScore0to100(dto.liquidityScore),
    imageUrl: dto.icon?.trim() || null,
  };
}
