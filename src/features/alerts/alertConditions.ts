import type { StoredAlert } from "@/storage/alertsStorage";

export interface PriceMetrics {
  priceUsd: number;
  changePercent24Hr: number;
}

export function isAlertConditionMet(
  alert: Pick<StoredAlert, "kind" | "threshold">,
  metrics: PriceMetrics
): boolean {
  switch (alert.kind) {
    case "price_above":
      return metrics.priceUsd >= alert.threshold;
    case "price_below":
      return metrics.priceUsd <= alert.threshold;
    case "pct_up":
      return metrics.changePercent24Hr >= alert.threshold;
    case "pct_down":
      return metrics.changePercent24Hr <= -Math.abs(alert.threshold);
    default:
      return false;
  }
}
