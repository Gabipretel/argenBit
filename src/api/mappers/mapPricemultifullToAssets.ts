import type { PricemultifullResponseDTO } from "@/api/dto/pricemultifull";
import { mapPricemultifullToAssetDetail } from "@/api/mappers/mapPricemultifullToAssetDetail";
import type { Asset } from "@/domain/models/Asset";

/** Varias monedas en un solo GET — orden respeta `orderFsyms`. */
export function mapPricemultifullToAssets(
  dto: PricemultifullResponseDTO,
  orderFsyms: string[]
): Asset[] {
  const out: Asset[] = [];
  let rank = 1;
  for (const fs of orderFsyms) {
    const upper = fs.toUpperCase();
    const detail = mapPricemultifullToAssetDetail(dto, upper);
    if (!detail) continue;
    out.push({
      rank: rank++,
      fsym: detail.fsym,
      name: detail.name,
      symbolDisplay: detail.symbolDisplay,
      priceUsd: detail.priceUsd,
      changePercent24Hr: detail.changePercent24Hr,
      marketCapUsd: detail.marketCapUsd,
      volume24hUsd: detail.volume24hUsd ?? null,
      imageUrl: detail.imageUrl,
    });
  }
  return out;
}
