import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppTopBar } from "@/common/components/layout/AppTopBar";
import { AppFriendlyLoader } from "@/common/components/ui/AppFriendlyLoader";
import { parseLocaleNumber } from "@/common/utils/parseLocaleNumber";
import { AlertRow } from "../components/AlertRow";
import { AlertsEmptyCallout } from "../components/AlertsEmptyCallout";
import { AlertsListHeader } from "../components/AlertsListHeader";
import { CreateAlertModal } from "../components/CreateAlertModal";
import { MAX_MARKET_ASSETS_FOR_SUGGESTIONS } from "../constants/alertUiConstants";
import { useAlerts } from "../hooks/useAlerts";
import { ensureNotificationPermissions } from "../localNotifications";
import { reactivateAlert } from "../runAlertEvaluation";
import {
  flattenTopCoinsPages,
  useTopCoinsInfiniteQuery,
} from "@/features/markets/hooks/useTopCoinsInfiniteQuery";
import type { AlertKind } from "@/storage/alertsStorage";
import type { StoredAlert } from "@/storage/alertsStorage";
import { colors, spacing } from "@/core/theme";

export function AlertsScreen() {
  const queryClient = useQueryClient();
  const { alerts, ready, addAlert, removeAlert } = useAlerts();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [assetSearchText, setAssetSearchText] = useState("");
  const [thresholdText, setThresholdText] = useState("");
  const [selectedKind, setSelectedKind] = useState<AlertKind>("price_above");

  const marketQuery = useTopCoinsInfiniteQuery("mcap", { enabled: isCreateModalVisible });
  const marketAssets = useMemo(
    () =>
      flattenTopCoinsPages(marketQuery.data?.pages).slice(0, MAX_MARKET_ASSETS_FOR_SUGGESTIONS * 2),
    [marketQuery.data?.pages]
  );

  const suggestedAssets = useMemo(() => {
    const searchQuery = assetSearchText.trim().toLowerCase();
    if (!searchQuery) return marketAssets.slice(0, MAX_MARKET_ASSETS_FOR_SUGGESTIONS);
    return marketAssets
      .filter(
        (asset) =>
          asset.fsym.toLowerCase().includes(searchQuery) ||
          asset.name.toLowerCase().includes(searchQuery) ||
          asset.symbolDisplay.toLowerCase().includes(searchQuery)
      )
      .slice(0, MAX_MARKET_ASSETS_FOR_SUGGESTIONS);
  }, [marketAssets, assetSearchText]);

  const openCreateAlertModal = useCallback(() => {
    setIsCreateModalVisible(true);
    setAssetSearchText("");
    setSelectedSymbol("");
    setThresholdText("");
    setSelectedKind("price_above");
  }, []);

  const closeCreateAlertModal = useCallback(() => {
    setIsCreateModalVisible(false);
    setSelectedSymbol("");
    setAssetSearchText("");
    setThresholdText("");
    setSelectedKind("price_above");
  }, []);

  const handleSelectAsset = useCallback((symbol: string) => {
    const normalizedSymbol = symbol.trim().toUpperCase();
    setSelectedSymbol(normalizedSymbol);
    setAssetSearchText(normalizedSymbol);
  }, []);

  const handleAssetSearchTextChange = useCallback((text: string) => {
    setAssetSearchText(text);
    setSelectedSymbol("");
  }, []);

  const saveNewAlert = useCallback(() => {
    const symbol = (selectedSymbol.trim() || assetSearchText.trim()).toUpperCase();
    const thresholdValue = parseLocaleNumber(thresholdText);
    if (!symbol || symbol.length < 2) {
      Alert.alert("Elegí un activo", "Seleccioná uno de la lista o escribí el símbolo (ej. BTC).");
      return;
    }
    if (thresholdValue === null) {
      Alert.alert(
        "Valor inválido",
        selectedKind === "pct_up" || selectedKind === "pct_down"
          ? "Ingresá un porcentaje con número (ej. 5 o 3,5)."
          : "Ingresá un precio en USD (podés usar coma o punto)."
      );
      return;
    }
    addAlert({ fsym: symbol, kind: selectedKind, threshold: thresholdValue });
    closeCreateAlertModal();
    void ensureNotificationPermissions().catch(() => {});
  }, [selectedSymbol, assetSearchText, thresholdText, selectedKind, addAlert, closeCreateAlertModal]);

  const removeAlertById = useCallback(
    (alertId: string) => {
      removeAlert(alertId);
    },
    [removeAlert]
  );

  const reactivateAlertById = useCallback(
    (alertId: string) => {
      void reactivateAlert(queryClient, alertId);
    },
    [queryClient]
  );

  const renderAlertListItem = useCallback(
    ({ item }: { item: StoredAlert }) => (
      <AlertRow
        alert={item}
        onRemovePress={removeAlertById}
        onReactivatePress={reactivateAlertById}
      />
    ),
    [removeAlertById, reactivateAlertById]
  );

  const getAlertItemKey = useCallback((item: StoredAlert) => item.id, []);

  const thresholdFieldLabel =
    selectedKind === "pct_up" || selectedKind === "pct_down"
      ? "Porcentaje del día (%)"
      : "Precio en dólares (USD)";
  const thresholdFieldPlaceholder =
    selectedKind === "pct_up" || selectedKind === "pct_down" ? "Ej. 5" : "Ej. 95000";

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <View style={styles.center}>
          <AppFriendlyLoader
            title="Cargando alertas"
            message="Leemos tus reglas guardadas en el dispositivo."
            icon="bell-ring-outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppTopBar
        trailing={
          <Pressable onPress={openCreateAlertModal} hitSlop={10} accessibilityLabel="Nueva alerta">
            <MaterialCommunityIcons name="plus-circle-outline" size={28} color={colors.primary} />
          </Pressable>
        }
      />
      <FlashList
        style={styles.listFlex}
        data={alerts}
        keyExtractor={getAlertItemKey}
        renderItem={renderAlertListItem}
        contentContainerStyle={alerts.length === 0 ? styles.listEmptyGrow : styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={AlertsListHeader}
        ListEmptyComponent={<AlertsEmptyCallout onCreateAlertPress={openCreateAlertModal} />}
      />

      <CreateAlertModal
        visible={isCreateModalVisible}
        onClosePress={closeCreateAlertModal}
        onSavePress={saveNewAlert}
        assetSearchText={assetSearchText}
        onAssetSearchTextChange={handleAssetSearchTextChange}
        selectedSymbol={selectedSymbol}
        thresholdText={thresholdText}
        onThresholdTextChange={setThresholdText}
        selectedKind={selectedKind}
        onKindChange={setSelectedKind}
        suggestedAssets={suggestedAssets}
        isLoadingSuggestions={marketQuery.isPending && isCreateModalVisible}
        hasSuggestionsError={marketQuery.isError}
        onSelectAsset={handleSelectAsset}
        thresholdFieldLabel={thresholdFieldLabel}
        thresholdFieldPlaceholder={thresholdFieldPlaceholder}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listFlex: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  listEmptyGrow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
});
