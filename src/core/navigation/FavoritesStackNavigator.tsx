import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { FavoritesStackParamList } from "@/core/navigation/types";
import { AssetDetailScreen } from "@/features/asset-detail";
import { FavoritesScreen } from "@/features/favorites";

const Stack = createNativeStackNavigator<FavoritesStackParamList>();

export function FavoritesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f9f9fc" },
      }}
    >
      <Stack.Screen
        name="FavoritesHome"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AssetDetail"
        component={AssetDetailScreen}
        options={{
          title: "Detalle",
          headerTintColor: "#236391",
          headerBackTitle: "Atrás",
        }}
      />
    </Stack.Navigator>
  );
}
