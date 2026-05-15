import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { NewsStackParamList } from "@/navigation/types";
import { colors } from "@/theme";
import { NewsDetailScreen } from "@/screens/news/NewsDetailScreen";
import { NewsScreen } from "@/screens/news/NewsScreen";

const Stack = createNativeStackNavigator<NewsStackParamList>();

export function NewsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="NewsHome"
        component={NewsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{
          title: "Pulso del mercado",
          headerTintColor: colors.primary,
          headerBackTitle: "Atrás",
        }}
      />
    </Stack.Navigator>
  );
}
