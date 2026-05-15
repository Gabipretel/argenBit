import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { AlertsStackParamList } from "@/navigation/types";
import { AlertsScreen } from "@/screens/alerts/AlertsScreen";

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
