import { FlashList, type FlashListRef } from "@shopify/flash-list";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { AppTopBar } from "@/common/components/layout/AppTopBar";
import {
  AppListLoadMoreIndicator,
  LIST_PAGINATION_END_THRESHOLD,
  MIN_LIST_LOAD_MORE_VISIBLE_MS,
} from "@/common/components/ui/AppListLoadMoreIndicator";
import { useScrollListToEndOnLoadMore } from "@/common/hooks/useScrollListToEndOnLoadMore";
import { ErrorCallout } from "@/common/components/ui/ErrorCallout";
import { useBinancePriceStream } from "@/common/hooks/useBinancePriceStream";
import { useDebouncedValue } from "@/common/hooks/useDebouncedValue";
import { useMinDurationActive } from "@/common/hooks/useMinDurationActive";
import { CryptoRow } from "../components/CryptoRow";
import { CryptoRowSkeleton, CryptoRowSkeletonList } from "../components/CryptoRowSkeleton";
import { MarketsSearchBar } from "../components/MarketsSearchBar";
import { marketsEmptySearchCopy } from "../constants/marketsEmptySearchCopy";
import { MAX_BINANCE_STREAMS } from "@/core/config/binanceWs";
import {
  flattenTopCoinsPages,
  useTopCoinsInfiniteQuery,
} from "../hooks/useTopCoinsInfiniteQuery";
import { assetDetailParamsFromAsset } from "@/core/navigation/assetDetailParams";
import type { MainTabParamList, MarketsStackParamList } from "@/core/navigation/types";
import type { Asset } from "@/domain/models/Asset";
import {
  dataFeedForPreset,
  setMarketPreset,
  setSearchTerm,
} from "@/core/store/slices/filtersSlice";
import type { FiltersState, MarketPreset } from "@/core/store/slices/filtersSlice";
import { selectFilteredMarketAssets } from "@/core/store/selectors/marketSelectors";
import type { RootState } from "@/core/store";
import { cardShadow, colors, radii, spacing, toolbarPanelShadow, typography } from "@/core/theme";


type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<MarketsStackParamList, "MarketsHome">,
  BottomTabNavigationProp<MainTabParamList>
>;

/** Mínimo visible para overlays / pie “cargar más” (caché de React Query suele ser muy rápida). */
const MIN_SKELETON_UI_MS = 600;
/** Mantiene el spinner del RefreshControl el tiempo mínimo (evita fallos al repetir el gesto en RN/FlashList). */
const MIN_PULL_TO_REFRESH_SPINNER_MS = 480;

function FilterTile({
  active,
  onPress,
  icon,
  title,
}: {
  active: boolean;
  onPress: () => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        active && styles.tileOn,
        pressed && styles.tilePressed,
      ]}
    >
      <View style={styles.tileIconWrap}>
        <MaterialCommunityIcons
          name={icon}
          size={30}
          color={active ? colors.primary : "rgba(35, 99, 145, 0.55)"}
        />
      </View>
      <Text
        style={[typography.labelMd, styles.tileTitle, active && styles.tileTitleOn]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function MarketsToolbar({
  filters,
  onSelectPreset,
}: {
  filters: FiltersState;
  onSelectPreset: (p: MarketPreset) => void;
}) {
  const p = filters.marketPreset;
  return (
    <View style={styles.toolbarWrap}>
      <Text style={[typography.headlineMd, styles.sectionTitle]}>Mercados</Text>
      <View style={styles.grid2}>
        <View style={styles.gridRow}>
          <FilterTile
            active={p === "price"}
            onPress={() => onSelectPreset("price")}
            icon="tag-outline"
            title="Precio"
          />
          <FilterTile
            active={p === "volume"}
            onPress={() => onSelectPreset("volume")}
            icon="swap-vertical"
            title="Volumen"
          />
        </View>
        <View style={styles.gridRow}>
          <FilterTile
            active={p === "cap100"}
            onPress={() => onSelectPreset("cap100")}
            icon="chart-box-outline"
            title="Market cap"
          />
          <FilterTile
            active={p === "supply"}
            onPress={() => onSelectPreset("supply")}
            icon="infinity"
            title="Circulante"
          />
        </View>
      </View>
    </View>
  );
}

function EmptyMarketsBanner({ searchTerm }: { searchTerm: string }) {
  const q = searchTerm.trim();
  const copy = marketsEmptySearchCopy();
  return (
    <View style={styles.emptyBanner} accessibilityRole="text">
      <MaterialCommunityIcons name="magnify-remove-outline" size={24} color={colors.primary} />
      <View style={styles.emptyBannerBody}>
        <Text style={styles.emptyBannerTitle}>{copy.title}</Text>
        <Text style={styles.emptyBannerText}>
          {q.length > 0 ? copy.bodyWithQuery(q) : copy.bodyFallback}
        </Text>
      </View>
    </View>
  );
}

export function MarketsHomeScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const filters = useSelector((s: RootState) => s.filters);

  const [searchLocal, setSearchLocal] = useState("");
  const debouncedSearch = useDebouncedValue(searchLocal, 320);

  useEffect(() => {
    dispatch(setSearchTerm(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  const feedKind = dataFeedForPreset(filters.marketPreset);
  const query = useTopCoinsInfiniteQuery(feedKind);
  const listRef = useRef<FlashListRef<Asset>>(null);

  const listBase = useMemo(
    () => flattenTopCoinsPages(query.data?.pages),
    [query.data?.pages]
  );

  const filtered = useSelector((state: RootState) =>
    selectFilteredMarketAssets(state, listBase)
  );

  const streamSymbols = useMemo(() => {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const a of filtered) {
      const u = a.fsym.toUpperCase();
      if (seen.has(u)) continue;
      seen.add(u);
      out.push(u);
      if (out.length >= MAX_BINANCE_STREAMS) break;
    }
    return out;
  }, [filtered]);

  useBinancePriceStream(streamSymbols, isFocused);

  const onPressAsset = (asset: Asset) => {
    navigation.navigate("AssetDetail", assetDetailParamsFromAsset(asset));
  };

  const goFavorites = () => {
    navigation.navigate("Favoritos");
  };

  const onSelectPreset = (preset: MarketPreset) => {
    dispatch(setMarketPreset(preset));
  };

  const isMarketListRefreshing =
    query.isFetching && !query.isPending && !query.isFetchingNextPage;
  const showPullRefreshSpinner = useMinDurationActive(
    isMarketListRefreshing,
    MIN_PULL_TO_REFRESH_SPINNER_MS
  );
  const showRefreshSkeleton = useMinDurationActive(isMarketListRefreshing, MIN_SKELETON_UI_MS);
  const showLoadMoreMinHold = useMinDurationActive(
    query.isFetchingNextPage,
    MIN_LIST_LOAD_MORE_VISIBLE_MS
  );
  const showLoadMoreFooter =
    filtered.length > 0 &&
    query.hasNextPage &&
    (query.isFetchingNextPage || showLoadMoreMinHold);

  useScrollListToEndOnLoadMore(listRef, showLoadMoreMinHold);

  const onEndReachedMarkets = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  const refreshMarketList = useCallback(() => {
    void query.refetch();
  }, [query]);

  const marketListRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={showPullRefreshSpinner}
        onRefresh={refreshMarketList}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    ),
    [showPullRefreshSpinner, refreshMarketList]
  );

  if (query.isPending && !query.data) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar
          trailing={
            <Pressable onPress={goFavorites} hitSlop={10} accessibilityLabel="Ir a favoritos">
              <MaterialCommunityIcons name="star-outline" size={26} color={colors.primary} />
            </Pressable>
          }
        />
        <View style={styles.searchSticky}>
          <MarketsSearchBar value={searchLocal} onChangeText={setSearchLocal} />
        </View>
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={styles.skeletonScroll}
          keyboardShouldPersistTaps="handled"
        >
          <MarketsToolbar filters={filters} onSelectPreset={onSelectPreset} />
          {Array.from({ length: 10 }).map((_, i) => (
            <CryptoRowSkeleton key={i} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (query.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar
          trailing={
            <Pressable onPress={goFavorites} hitSlop={10}>
              <MaterialCommunityIcons name="star-outline" size={26} color={colors.primary} />
            </Pressable>
          }
        />
        {/* <View style={styles.searchSticky}>
          <View style={styles.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={22} color={colors.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o símbolo"
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchLocal}
              onChangeText={setSearchLocal}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

        </View> */}
        <View style={styles.centered}>
          <ErrorCallout
            title="Mercado no disponible"
            message={"Por el momento no se encuentra disponible el mercado. Por favor, inténtelo más tarde."}
            onRetry={() => query.refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const emptyFilter = listBase.length > 0 && filtered.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppTopBar
        trailing={
          <Pressable onPress={goFavorites} hitSlop={10} accessibilityLabel="Ir a favoritos">
            <MaterialCommunityIcons name="star-outline" size={26} color={colors.primary} />
          </Pressable>
        }
      />
      <View style={styles.searchSticky}>
        <MarketsSearchBar value={searchLocal} onChangeText={setSearchLocal} />
      </View>
      <View style={styles.listShell}>
        {showRefreshSkeleton ? (
          <View style={styles.refreshSkeletonLayer} pointerEvents="auto">
            <CryptoRowSkeletonList count={8} />
          </View>
        ) : null}
        <FlashList
          ref={listRef}
          key={`${feedKind}-${filters.marketPreset}`}
          extraData={`${query.dataUpdatedAt}-${query.isFetchingNextPage}-${showLoadMoreMinHold}`}
          style={styles.flashFlex}
          data={filtered}
          renderItem={({ item }) => (
            <CryptoRow asset={item} onPress={() => onPressAsset(item)} />
          )}
          keyExtractor={(item) => item.fsym}
          contentContainerStyle={styles.listContent}
          refreshControl={marketListRefreshControl}
          onEndReached={onEndReachedMarkets}
          onEndReachedThreshold={LIST_PAGINATION_END_THRESHOLD}
          ListHeaderComponent={
            <>
              <MarketsToolbar filters={filters} onSelectPreset={onSelectPreset} />
              {emptyFilter ? (
                <EmptyMarketsBanner searchTerm={filters.searchTerm} />
              ) : null}
            </>
          }
          ListFooterComponent={
            showLoadMoreFooter ? (
              <View style={styles.footerBlock}>
                <AppListLoadMoreIndicator message="Cargando más activos…" />
              </View>
            ) : null
          }
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
  listShell: {
    flex: 1,
    position: "relative",
  },
  refreshSkeletonLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  searchSticky: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  scrollFlex: {
    flex: 1,
  },
  skeletonScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  flashFlex: {
    flex: 1,
  },
  toolbarWrap: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    padding: spacing.base,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...toolbarPanelShadow,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    marginTop: 0,
    color: colors.primary,
  },
  grid2: {
    gap: spacing.sm,
  },
  gridRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceBright,
  },
  tileOn: {
    borderColor: colors.primary,
    backgroundColor: "rgba(35, 99, 145, 0.1)",
  },
  tilePressed: {
    opacity: 0.92,
  },
  tileIconWrap: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: {
    flex: 1,
    color: colors.onSurface,
    fontWeight: "700",
  },
  tileTitleOn: {
    color: colors.primary,
  },
  emptyBanner: {
    marginBottom: spacing.base,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    ...cardShadow,
  },
  emptyBannerBody: {
    flex: 1,
    gap: 2,
  },
  emptyBannerTitle: {
    ...typography.labelMd,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyBannerText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "500",
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    paddingHorizontal: spacing.lg,
  },
  footerBlock: {
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
