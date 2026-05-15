import type { StoredAlert } from "@/storage/alertsStorage";

export interface PriceMetrics {
  priceUsd: number;
  changePercent24Hr: number;
}

/**
 * §7.7 — comparar precio actual y variación 24h del snapshot en caché con la regla.
 * `pct_down`: umbral positivo en UI → compara contra variación ≤ −threshold.
 */
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
