import type { PricemultifullResponseDTO } from "@/api/dto/pricemultifull";
import { resolveCoinImageUrl } from "@/api/mappers/mapTopCoinEntryToAsset";
import type { AssetDetail } from "@/domain/models/AssetDetail";

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const x = parseFloat(v);
    return Number.isFinite(x) ? x : null;
  }
  return null;
}

export function mapPricemultifullToAssetDetail(
  dto: PricemultifullResponseDTO,
  fsymUpper: string,
  fallbackName?: string
): AssetDetail | null {
  const coin = dto.RAW?.[fsymUpper]?.USD;
  if (!coin) return null;

  const price = num(coin.PRICE) ?? 0;
  const change = num(coin.CHANGEPCT24HOUR) ?? 0;
  const mcap = num(coin.MKTCAP);
  const vol =
    num(coin.TOTALVOLUME24HTO) ??
    num(coin.TOTALTOPTIERVOLUME24HTO) ??
    num((coin as { VOLUME24HOURTO?: unknown }).VOLUME24HOURTO);
  const circ =
    num(coin.CIRCULATINGSUPPLY) ?? num(coin.SUPPLY);
  const maxS = num(coin.MAXSUPPLY);

  const sym =
    typeof coin.FROMSYMBOL === "string" ? coin.FROMSYMBOL : fsymUpper;
  const name =
    typeof coin.FROMSYMBOLNAME === "string"
      ? coin.FROMSYMBOLNAME
      : fallbackName ?? sym;

  const imgRaw =
    typeof coin.IMAGEURL === "string"
      ? coin.IMAGEURL
      : (coin as { IMAGEURL?: string }).IMAGEURL;

  return {
    fsym: fsymUpper,
    name,
    symbolDisplay: sym.toUpperCase(),
    priceUsd: price,
    changePercent24Hr: change,
    marketCapUsd: mcap,
    volume24hUsd: vol,
    circulatingSupply: circ,
    maxSupply: maxS,
    imageUrl: resolveCoinImageUrl(imgRaw),
  };
}
