import type { CoinListItemDto } from "@/core/api/dto/coinList";
import type { AssetDetail } from "@/domain/models/AssetDetail";

function mapPct(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

type LegacyAssetDetail = AssetDetail & { changePercent24Hr?: number };

/** Normaliza detalle en caché (campos `priceChange*` o legado `changePercent24Hr`). */
export function ensureAssetDetail(detail: LegacyAssetDetail): AssetDetail {
  const legacy24 = detail.changePercent24Hr;
  return {
    ...detail,
    priceChange1h: mapPct(detail.priceChange1h),
    priceChange1d: mapPct(detail.priceChange1d ?? legacy24),
    priceChange1w: mapPct(detail.priceChange1w),
    priceChange1m: mapPct(detail.priceChange1m),
  };
}

export function mapCoinToAssetDetail(
  dto: CoinListItemDto,
  fallbackName?: string
): AssetDetail {
  const sym = (dto.symbol || "").trim().toUpperCase() || "?";
  const avail = dto.availableSupply;
  const total = dto.totalSupply;
  return ensureAssetDetail({
    coinId: dto.id,
    fsym: sym,
    name: (dto.name?.trim() || fallbackName?.trim() || sym).trim(),
    symbolDisplay: sym,
    priceUsd: typeof dto.price === "number" ? dto.price : 0,
    priceChange1h: mapPct(dto.priceChange1h),
    priceChange1d: mapPct(dto.priceChange1d),
    priceChange1w: mapPct(dto.priceChange1w),
    priceChange1m: mapPct(dto.priceChange1m),
    marketCapUsd: typeof dto.marketCap === "number" ? dto.marketCap : null,
    volume24hUsd: typeof dto.volume === "number" ? dto.volume : null,
    circulatingSupply: typeof avail === "number" ? avail : null,
    maxSupply: typeof total === "number" ? total : null,
    imageUrl: dto.icon?.trim() || null,
  });
}
