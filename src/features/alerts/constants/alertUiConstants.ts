import { colors } from "@/core/theme";
import type { AlertKind } from "@/storage/alertsStorage";

export const ALERT_ACCENT_COLOR: Record<AlertKind, string> = {
  price_above: colors.success,
  price_below: colors.error,
  pct_up: colors.success,
  pct_down: colors.error,
};

export const ALERT_ICON_NAME: Record<AlertKind, string> = {
  price_above: "trending-up",
  price_below: "trending-down",
  pct_up: "rocket-launch-outline",
  pct_down: "chart-line-variant",
};

/** Opciones del modal «Nueva alerta». */
export const ALERT_KIND_OPTIONS: {
  kind: AlertKind;
  title: string;
  hint: string;
}[] = [
  {
    kind: "price_above",
    title: "Supera un precio",
    hint: "Te avisamos cuando el precio en USD sea mayor al valor que elijas.",
  },
  {
    kind: "price_below",
    title: "Baja de un precio",
    hint: "Te avisamos cuando el precio en USD sea menor al valor que elijas.",
  },
  {
    kind: "pct_up",
    title: "Sube mucho en el día",
    hint: "Comparamos la variación del día (respecto de ayer). Aviso si supera el % que pongas.",
  },
  {
    kind: "pct_down",
    title: "Cae mucho en el día",
    hint: "Si la caída del día supera el % que indiques, te lo decimos.",
  },
];

/** Texto resumido en cada tarjeta de la lista. */
export const ALERT_KIND_CARD_SUMMARY: Record<AlertKind, string> = {
  price_above: "Precio por encima de",
  price_below: "Precio por debajo de",
  pct_up: "Subida del día mayor a",
  pct_down: "Caída del día mayor a",
};

export function getAlertKindTitle(kind: AlertKind): string {
  return ALERT_KIND_OPTIONS.find((option) => option.kind === kind)?.title ?? kind;
}

export const MAX_MARKET_ASSETS_FOR_SUGGESTIONS = 40;
