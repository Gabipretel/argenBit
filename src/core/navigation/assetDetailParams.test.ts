import { assetDetailParamsFromAsset } from "./assetDetailParams";
import type { Asset } from "@/domain/models/Asset";

const asset: Asset = {
  coinId: "bitcoin",
  rank: 1,
  fsym: "BTC",
  name: "Bitcoin",
  symbolDisplay: "BTC",
  priceUsd: 80_000,
  changePercent24Hr: 1,
  marketCapUsd: 1e12,
  volume24hUsd: 1e10,
  circulatingSupply: 19e6,
  riskScore: 3.6,
  volatilityScore: 3.8,
  liquidityScore: 92.9,
  imageUrl: null,
};

describe("assetDetailParamsFromAsset", () => {
  it("incluye puntajes cuando el Asset los trae del listado", () => {
    expect(assetDetailParamsFromAsset(asset)).toMatchObject({
      fsym: "BTC",
      riskScore: 3.6,
      volatilityScore: 3.8,
      liquidityScore: 92.9,
    });
  });

  it("omite puntajes si son null", () => {
    const params = assetDetailParamsFromAsset({
      ...asset,
      riskScore: null,
      volatilityScore: null,
      liquidityScore: null,
    });
    expect(params).not.toHaveProperty("riskScore");
    expect(params).not.toHaveProperty("volatilityScore");
    expect(params).not.toHaveProperty("liquidityScore");
  });
});
