import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

/**
 * En Expo Go (StoreClient), desde SDK 53, Android no expone el runtime nativo de
 * `expo-notifications`. Importar ese paquete al inicio rompe la app; usar solo en dev build / standalone.
 */
export function shouldLoadExpoNotifications(): boolean {
  if (Platform.OS === "web") return false;
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}
