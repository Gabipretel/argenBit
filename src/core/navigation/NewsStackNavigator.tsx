import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { NewsStackParamList } from "@/core/navigation/types";
import { colors } from "@/core/theme";
import { NewsDetailScreen, NewsScreen } from "@/features/news";

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
