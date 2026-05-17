import { mapCoinToAssetDetail } from "./mapCoinToAssetDetail";
import type { CoinListItemDto } from "@/core/api/dto/coinList";

const baseDto: CoinListItemDto = {
  id: "bitcoin",
  icon: "",
  name: "Bitcoin",
  symbol: "BTC",
  rank: 1,
  price: 50_000,
  volume: 1e10,
  marketCap: 1e12,
  priceChange1d: 2.15,
};

describe("mapCoinToAssetDetail", () => {
  it("mapea priceChange1h/1d/1w/1m del detalle CoinStats", () => {
    const detail = mapCoinToAssetDetail({
      ...baseDto,
      priceChange1h: 0.75,
      priceChange1w: -1.42,
      priceChange1m: 4.25,
    });

    expect(detail.priceChange1h).toBe(0.75);
    expect(detail.priceChange1d).toBe(2.15);
    expect(detail.priceChange1w).toBe(-1.42);
    expect(detail.priceChange1m).toBe(4.25);
  });
});
