import { Platform, type ViewStyle } from "react-native";

/** Tarjetas y campos elevados (listas, buscador, paneles). */
export const cardShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  android: { elevation: 5 },
  default: {},
});

/** Diálogos y superficies elevadas. */
export const modalShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
  },
  android: { elevation: 10 },
  default: {},
});

/** Misma lógica que `cardShadow` (panel filtros Mercados). */
export const toolbarPanelShadow: ViewStyle = cardShadow;
