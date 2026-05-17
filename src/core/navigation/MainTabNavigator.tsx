import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlertsStackNavigator } from "@/core/navigation/AlertsStackNavigator";
import { FavoritesStackNavigator } from "@/core/navigation/FavoritesStackNavigator";
import { MarketsStackNavigator } from "@/core/navigation/MarketsStackNavigator";
import { NewsStackNavigator } from "@/core/navigation/NewsStackNavigator";
import type { MainTabParamList } from "@/core/navigation/types";
import { colors, spacing } from "@/core/theme";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, spacing.sm);

  const tabBarVisibleStyle = {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    paddingBottom: bottomPad,
    minHeight: 56 + bottomPad,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
      default: {},
    }),
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarActiveBackgroundColor: "transparent",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarItemStyle: {
          marginHorizontal: 2,
          marginVertical: 4,
          height: 48,
        },
        tabBarStyle: tabBarVisibleStyle,
      }}
    >
      <Tab.Screen
        name="Mercados"
        component={MarketsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritesStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="star" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Noticias"
        component={NewsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="newspaper" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
