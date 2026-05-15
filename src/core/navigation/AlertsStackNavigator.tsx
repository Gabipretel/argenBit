import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { AlertsStackParamList } from "@/core/navigation/types";
import { AlertsScreen } from "@/features/alerts";

const Stack = createNativeStackNavigator<AlertsStackParamList>();

export function AlertsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f9f9fc" },
      }}
    >
      <Stack.Screen
        name="AlertsHome"
        component={AlertsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
