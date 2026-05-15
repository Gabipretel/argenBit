import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { MarketsStackParamList } from "@/core/navigation/types";
import { AssetDetailScreen } from "@/features/asset-detail";
import { MarketsHomeScreen } from "@/features/markets";

const Stack = createNativeStackNavigator<MarketsStackParamList>();

export function MarketsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f9f9fc" },
      }}
    >
      <Stack.Screen
        name="MarketsHome"
        component={MarketsHomeScreen}
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
