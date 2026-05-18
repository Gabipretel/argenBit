import { Platform, type ViewStyle } from "react-native";

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

export const toolbarPanelShadow: ViewStyle = cardShadow;
