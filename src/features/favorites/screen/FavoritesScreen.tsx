import { FlashList } from "@shopify/flash-list";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppTopBar } from "@/common/components/layout/AppTopBar";
import { ErrorCallout } from "@/common/components/ui/ErrorCallout";
import { useBinancePriceStream } from "@/common/hooks/useBinancePriceStream";
import { useMinDurationActive } from "@/common/hooks/useMinDurationActive";
import { CryptoRow } from "@/features/markets/components/CryptoRow";
import {
  flattenTopCoinsPages,
  useTopCoinsInfiniteQuery,
} from "@/features/markets/hooks/useTopCoinsInfiniteQuery";
import {
  FavoritesEmptyStateSkeleton,
  FavoritesListInitialSkeleton,
} from "../components/FavoritesLayoutSkeleton";
import { EmptyFavoritesHero } from "../components/EmptyFavoritesHero";
import { FavoritesQuickTipsSection } from "../components/FavoritesQuickTipsSection";
import { FavoritesSuggestionsSection } from "../components/FavoritesSuggestionsSection";
import { useFavoriteAssetsQuery } from "../hooks/useFavoriteAssetsQuery";
import { useFavorites } from "../FavoritesContext";
import type { Asset } from "@/domain/models/Asset";
import type { FavoritesStackParamList, MainTabParamList } from "@/core/navigation/types";
import { colors, spacing, typography } from "@/core/theme";

type FavoritesNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<FavoritesStackParamList, "FavoritesHome">,
  BottomTabNavigationProp<MainTabParamList>
>;

const MAX_SUGGESTED_ASSETS = 8;
const MIN_SKELETON_OVERLAY_MS = 600;
/** Mantiene el spinner del RefreshControl el tiempo mínimo (evita fallos al repetir el gesto en RN/FlashList). */
const MIN_PULL_TO_REFRESH_SPINNER_MS = 480;

export function FavoritesScreen() {
  const navigation = useNavigation<FavoritesNavigation>();
  const isScreenFocused = useIsFocused();
  const { entries, fsyms, ready } = useFavorites();
  const favoriteAssetsQuery = useFavoriteAssetsQuery(entries);
  const marketSuggestionsQuery = useTopCoinsInfiniteQuery("mcap");

  const priceStreamSymbols = useMemo(
    () => fsyms.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean),
    [fsyms]
  );

  useBinancePriceStream(priceStreamSymbols, isScreenFocused && ready && fsyms.length > 0);

  const suggestedAssets = useMemo(
    () => flattenTopCoinsPages(marketSuggestionsQuery.data?.pages).slice(0, MAX_SUGGESTED_ASSETS),
    [marketSuggestionsQuery.data?.pages]
  );

  const isEmptyFavoritesReady = ready && fsyms.length === 0;
  const isSuggestionsLoadingOverlayActive =
    isEmptyFavoritesReady &&
    ((marketSuggestionsQuery.isPending && !marketSuggestionsQuery.data) ||
      (marketSuggestionsQuery.isFetching && !marketSuggestionsQuery.isPending));
  const showSuggestionsLoadingOverlay = useMinDurationActive(
    isSuggestionsLoadingOverlayActive,
    MIN_SKELETON_OVERLAY_MS
  );

  const isFavoritesListRefreshing =
    ready && fsyms.length > 0 && (favoriteAssetsQuery.isRefetching || marketSuggestionsQuery.isRefetching);
  const showFavoritesListRefreshOverlay = useMinDurationActive(
    isFavoritesListRefreshing,
    MIN_SKELETON_OVERLAY_MS
  );

  const isEmptyStateRefreshing = isEmptyFavoritesReady && marketSuggestionsQuery.isRefetching;
  const showEmptyStatePullRefreshSpinner = useMinDurationActive(
    isEmptyStateRefreshing,
    MIN_PULL_TO_REFRESH_SPINNER_MS
  );

  const showFavoritesListPullRefreshSpinner = useMinDurationActive(
    isFavoritesListRefreshing,
    MIN_PULL_TO_REFRESH_SPINNER_MS
  );

  const navigateToAssetDetail = useCallback(
    (asset: Asset) => {
      navigation.navigate("AssetDetail", {
        fsym: asset.fsym,
        coinId: asset.coinId,
        displayName: asset.name,
        rank: asset.rank,
      });
    },
    [navigation]
  );

  const navigateToMarkets = useCallback(() => {
    navigation.navigate("Mercados");
  }, [navigation]);

  const navigateToAlerts = useCallback(() => {
    navigation.navigate("Alertas");
  }, [navigation]);

  const refreshFavoritesAndSuggestions = useCallback(() => {
    void Promise.all([
      marketSuggestionsQuery.refetch(),
      fsyms.length > 0 ? favoriteAssetsQuery.refetch() : Promise.resolve(),
    ]);
  }, [marketSuggestionsQuery, favoriteAssetsQuery, fsyms.length]);

  const emptyStateRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={showEmptyStatePullRefreshSpinner}
        onRefresh={refreshFavoritesAndSuggestions}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    ),
    [showEmptyStatePullRefreshSpinner, refreshFavoritesAndSuggestions]
  );

  const favoritesListRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={showFavoritesListPullRefreshSpinner}
        onRefresh={refreshFavoritesAndSuggestions}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    ),
    [showFavoritesListPullRefreshSpinner, refreshFavoritesAndSuggestions]
  );

  const favoritesListFooter = useMemo(
    () => (
      <View style={styles.listFooterStack}>
        <FavoritesSuggestionsSection
          suggestedAssets={suggestedAssets}
          marketSuggestionsQuery={marketSuggestionsQuery}
          onAssetPress={navigateToAssetDetail}
          topSpacing={spacing.lg}
        />
        <FavoritesQuickTipsSection
          onGoToMarketsPress={navigateToMarkets}
          onGoToAlertsPress={navigateToAlerts}
        />
      </View>
    ),
    [suggestedAssets, marketSuggestionsQuery, navigateToAssetDetail, navigateToMarkets, navigateToAlerts]
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.pad, styles.listContentGrow]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FavoritesListInitialSkeleton rowCount={5} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (fsyms.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <View style={styles.fill}>
          {showSuggestionsLoadingOverlay ? (
            <View style={styles.refreshSkelLayer} pointerEvents="none">
              <ScrollView
                style={styles.fill}
                contentContainerStyle={styles.refreshSkelScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <FavoritesEmptyStateSkeleton />
              </ScrollView>
            </View>
          ) : null}
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.emptyScroll}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical
            refreshControl={emptyStateRefreshControl}
          >
            <Text style={styles.favScreenTitle}>Mis favoritos</Text>
            <EmptyFavoritesHero onGoToMarketsPress={navigateToMarkets} />
            <FavoritesSuggestionsSection
              suggestedAssets={suggestedAssets}
              marketSuggestionsQuery={marketSuggestionsQuery}
              onAssetPress={navigateToAssetDetail}
              topSpacing={spacing.lg}
            />
            <FavoritesQuickTipsSection
              onGoToMarketsPress={navigateToMarkets}
              onGoToAlertsPress={navigateToAlerts}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (favoriteAssetsQuery.isPending && !favoriteAssetsQuery.data) {
    const skeletonRowCount = Math.min(Math.max(fsyms.length, 4), 10);
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.pad, styles.listContentGrow]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FavoritesListInitialSkeleton rowCount={skeletonRowCount} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (favoriteAssetsQuery.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <View style={styles.centered}>
          <ErrorCallout
            title="Favoritos no disponibles"
            message="Por el momento no se encuentran disponibles los favoritos. Por favor, inténtelo más tarde."
            onRetry={() => favoriteAssetsQuery.refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const favoriteAssets = favoriteAssetsQuery.data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppTopBar />
      <View style={styles.fill}>
        {showFavoritesListRefreshOverlay ? (
          <View style={styles.refreshSkelLayer} pointerEvents="none">
            <ScrollView
              style={styles.fill}
              contentContainerStyle={styles.refreshSkelScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FavoritesListInitialSkeleton
                rowCount={Math.min(Math.max(favoriteAssets.length, 4), 10)}
                showFooter
              />
            </ScrollView>
          </View>
        ) : null}
        <FlashList
          style={styles.fill}
          extraData={`${showFavoritesListPullRefreshSpinner}-${favoriteAssetsQuery.dataUpdatedAt}-${marketSuggestionsQuery.dataUpdatedAt}`}
          data={favoriteAssets}
          renderItem={({ item }) => (
            <CryptoRow asset={item} onPress={() => navigateToAssetDetail(item)} />
          )}
          keyExtractor={(item) => item.fsym}
          contentContainerStyle={[styles.listContent, styles.listContentGrow]}
          refreshControl={favoritesListRefreshControl}
          ListHeaderComponent={
            <Text style={[styles.favScreenTitle, styles.favListTitleOnly]}>Mis favoritos</Text>
          }
          ListEmptyComponent={
            favoriteAssetsQuery.isPending ? null : (
              <View style={styles.listEmptyBlock}>
                <EmptyFavoritesHero onGoToMarketsPress={navigateToMarkets} />
              </View>
            )
          }
          ListFooterComponent={favoritesListFooter}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
    position: "relative",
  },
  refreshSkelLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  refreshSkelScroll: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  emptyScroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  favScreenTitle: {
    ...typography.headlineMd,
    marginTop: spacing.sm,
    marginBottom: spacing.base,
    color: colors.primary,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    fontWeight: "800",
  },
  favListTitleOnly: {
    marginBottom: spacing.sm,
  },
  pad: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  listContentGrow: {
    flexGrow: 1,
  },
  listFooterStack: {
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  listEmptyBlock: {
    marginBottom: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
});
