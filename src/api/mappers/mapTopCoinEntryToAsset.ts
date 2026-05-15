import type { TopCoinEntryDTO } from "@/api/dto/topMktCapFull";
import type { Asset } from "@/domain/models/Asset";

const CRYPTOCOMPARE_ORIGIN = "https://www.cryptocompare.com";

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const x = parseFloat(v);
    return Number.isFinite(x) ? x : null;
  }
  return null;
}

export function resolveCoinImageUrl(imageUrl: string | undefined): string | null {
  if (!imageUrl?.trim()) return null;
  const u = imageUrl.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${CRYPTOCOMPARE_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
}

export function mapTopCoinEntryToAsset(dto: TopCoinEntryDTO, rank: number): Asset {
  const usd = dto.RAW?.USD ?? {};
  const price = num(usd.PRICE) ?? 0;
  const change = num(usd.CHANGEPCT24HOUR) ?? 0;
  const mcap = num(usd.MKTCAP);
  const vol =
    num(usd.TOTALVOLUME24HTO) ??
    num(usd.TOTALTOPTIERVOLUME24HTO) ??
    num((usd as { VOLUME24HOURTO?: unknown }).VOLUME24HOURTO) ??
    num((usd as { VOLUME24HOUR?: unknown }).VOLUME24HOUR);
  const fromSym =
    (typeof usd.FROMSYMBOL === "string" ? usd.FROMSYMBOL : dto.CoinInfo.Internal) || "?";

  return {
    rank,
    fsym: dto.CoinInfo.Internal || fromSym,
    name: dto.CoinInfo.FullName || dto.CoinInfo.Name,
    symbolDisplay: fromSym.toUpperCase(),
    priceUsd: price,
    changePercent24Hr: change,
    marketCapUsd: mcap,
    volume24hUsd: vol,
    imageUrl: resolveCoinImageUrl(dto.CoinInfo.ImageUrl),
  };
}
