import type { Asset } from "@/domain/models/Asset";

/** Params de `AssetDetail`  */
export type AssetDetailParams = {
  fsym: string;
  coinId: string;
  displayName?: string;
  rank?: number;
  riskScore?: number;
  volatilityScore?: number;
  liquidityScore?: number;
};

export function assetDetailParamsFromAsset(asset: Asset): AssetDetailParams {
  return {
    fsym: asset.fsym,
    coinId: asset.coinId,
    displayName: asset.name,
    rank: asset.rank,
    ...(asset.riskScore != null ? { riskScore: asset.riskScore } : {}),
    ...(asset.volatilityScore != null ? { volatilityScore: asset.volatilityScore } : {}),
    ...(asset.liquidityScore != null ? { liquidityScore: asset.liquidityScore } : {}),
  };
}
