import { FlashList } from "@shopify/flash-list";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  FavoritesEmptyStateSkeleton,
  FavoritesListInitialSkeleton,
} from "@/components/favorites/FavoritesLayoutSkeleton";
import { CryptoRow } from "@/components/markets/CryptoRow";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { useFavoriteAssetsQuery } from "@/hooks/useFavoriteAssetsQuery";
import { useCryptocomparePriceStream } from "@/hooks/useCryptocomparePriceStream";
import { useFavorites } from "@/hooks/useFavorites";
import { useMinDurationActive } from "@/hooks/useMinDurationActive";
import {
  flattenTopCoinsPages,
  useTopCoinsInfiniteQuery,
} from "@/hooks/useTopCoinsInfiniteQuery";
import type { Asset } from "@/domain/models/Asset";
import type { FavoritesStackParamList, MainTabParamList } from "@/navigation/types";
import { colors, cardShadow, radii, spacing, typography } from "@/theme";
import { formatUsd } from "@/utils/formatters";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<FavoritesStackParamList, "FavoritesHome">,
  BottomTabNavigationProp<MainTabParamList>
>;

const SUGGEST_COUNT = 8;
const MIN_SKEL_UI_MS = 600;
const MIN_PULL_REFRESH_UI_MS = 480;

type SuggestQuery = Pick<
  ReturnType<typeof useTopCoinsInfiniteQuery>,
  "isPending" | "isError" | "isFetching" | "data" | "refetch" | "dataUpdatedAt"
>;

function EmptyFavoritesHero({ goMarkets }: { goMarkets: () => void }) {
  return (
    <View style={styles.emptyHero}>
      <View style={styles.emptyIconRing}>
        <MaterialCommunityIcons name="bookmark-plus-outline" size={34} color={colors.primary} />
      </View>
      <Text style={[typography.headlineMd, styles.emptyTitle]}>Tu lista está vacía</Text>
      <Pressable
        onPress={goMarkets}
        style={({ pressed }) => [styles.primaryCta, pressed && styles.primaryCtaPressed]}
      >
        <MaterialCommunityIcons name="store-search-outline" size={22} color={colors.onPrimary} />
        <Text style={styles.primaryCtaTxt}>Ir a Mercados</Text>
      </Pressable>
    </View>
  );
}

function FavoritesQuickTipsSection({
  goMarkets,
  goAlerts,
}: {
  goMarkets: () => void;
  goAlerts: () => void;
}) {
  return (
    <View style={styles.tipsSection}>
      <View style={styles.tipsHeaderRow}>
        <MaterialCommunityIcons name="lightning-bolt-outline" size={22} color={colors.primary} />
        <Text style={styles.tipsSectionTitle}>Seguí el ritmo</Text>
      </View>
      <Pressable
        onPress={goAlerts}
        style={({ pressed }) => [styles.tipRow, pressed && styles.tipRowPressed]}
        accessibilityRole="button"
        accessibilityLabel="Ir a alertas de precio"
      >
        <View style={styles.tipIconWrap}>
          <MaterialCommunityIcons name="bell-ring-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.tipTextCol}>
          <Text style={styles.tipRowTitle}>Alertas de precio</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.outline} />
      </Pressable>
      <Pressable
        onPress={goMarkets}
        style={({ pressed }) => [styles.tipRow, pressed && styles.tipRowPressed]}
        accessibilityRole="button"
        accessibilityLabel="Ir a mercados"
      >
        <View style={styles.tipIconWrap}>
          <MaterialCommunityIcons name="store-search-outline" size={22} color={colors.success} />
        </View>
        <View style={styles.tipTextCol}>
          <Text style={styles.tipRowTitle}>Mercados y filtros</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.outline} />
      </Pressable>
    </View>
  );
}

function FavoritesSuggestionsSection({
  suggestions,
  suggestQuery,
  onPressAsset,
  topInset = 0,
}: {
  suggestions: Asset[];
  suggestQuery: SuggestQuery;
  onPressAsset: (a: Asset) => void;
  topInset?: number;
}) {
  return (
    <View style={[styles.suggestSectionRoot, topInset > 0 && { paddingTop: topInset }]}>
      <View style={styles.suggestBlock}>
        <View style={styles.suggestHeaderRow}>
          <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={colors.primary} />
          <Text style={styles.suggestTitle}>Sugerencias para vos</Text>
        </View>
        <View style={styles.suggestPill}>
          <Text style={styles.suggestPillTxt}>Top por capitalización</Text>
        </View>
      </View>

      {suggestQuery.isPending && !suggestQuery.data ? null : suggestQuery.isError ? (
        <Text style={[typography.bodyMd, styles.suggestErr]}>
          No pudimos cargar sugerencias. Probá tirar hacia abajo para reintentar.
        </Text>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.suggestRow, styles.suggestRowAlign]}
        >
          {suggestions.map((a) => (
            <Pressable
              key={a.fsym}
              onPress={() => onPressAsset(a)}
              style={({ pressed }) => [styles.suggestCard, pressed && styles.suggestCardPressed]}
            >
              <View style={styles.suggestRowInner}>
                <View style={styles.suggestThumbWrap}>
                  {a.imageUrl ? (
                    <Image
                      source={{ uri: a.imageUrl }}
                      style={styles.suggestThumb}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.suggestThumb, styles.suggestPh]}>
                      <Text style={styles.suggestPhTxt}>
                        {(a.symbolDisplay || a.fsym).slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.suggestMid}>
                  <Text style={styles.suggestNameMain} numberOfLines={1}>
                    {a.name}
                  </Text>
                  <Text style={[typography.caption, styles.suggestSymSub]} numberOfLines={1}>
                    {a.symbolDisplay}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outline} />
              </View>
              <Text style={styles.suggestPrice}>{formatUsd(a.priceUsd)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const { fsyms, ready } = useFavorites();
  const query = useFavoriteAssetsQuery(fsyms);
  const suggestQuery = useTopCoinsInfiniteQuery("mcap");

  const streamSymbols = useMemo(
    () => fsyms.map((s) => s.trim().toUpperCase()).filter(Boolean),
    [fsyms]
  );

  useCryptocomparePriceStream(streamSymbols, isFocused && ready && fsyms.length > 0);

  const suggestions = useMemo(
    () => flattenTopCoinsPages(suggestQuery.data?.pages).slice(0, SUGGEST_COUNT),
    [suggestQuery.data?.pages]
  );

  const readyEmpty = ready && fsyms.length === 0;
  const suggestOverlayActive =
    readyEmpty &&
    ((suggestQuery.isPending && !suggestQuery.data) ||
      (suggestQuery.isFetching && !suggestQuery.isPending));
  const showSuggestSkelOverlay = useMinDurationActive(suggestOverlayActive, MIN_SKEL_UI_MS);

  const listRefetchActive =
    ready &&
    fsyms.length > 0 &&
    (query.isRefetching || suggestQuery.isRefetching);
  const showFavListSkelOverlay = useMinDurationActive(listRefetchActive, MIN_SKEL_UI_MS);

  const emptySuggestRefetching = readyEmpty && suggestQuery.isRefetching;
  const emptyPullRefreshUi = useMinDurationActive(emptySuggestRefetching, MIN_PULL_REFRESH_UI_MS);

  const listPullRefreshUi = useMinDurationActive(listRefetchActive, MIN_PULL_REFRESH_UI_MS);

  const onPressAsset = (asset: Asset) => {
    navigation.navigate("AssetDetail", {
      fsym: asset.fsym,
      displayName: asset.name,
      rank: asset.rank,
    });
  };

  const goMarkets = () => {
    navigation.navigate("Mercados");
  };

  const goAlerts = () => {
    navigation.navigate("Alertas");
  };

  const onRefreshFavsAndSuggest = useCallback(() => {
    void Promise.all([
      suggestQuery.refetch(),
      fsyms.length > 0 ? query.refetch() : Promise.resolve(),
    ]);
  }, [suggestQuery, query, fsyms.length]);

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
          {showSuggestSkelOverlay ? (
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
            refreshControl={
              <RefreshControl
                refreshing={emptyPullRefreshUi}
                onRefresh={onRefreshFavsAndSuggest}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
          <Text style={styles.favScreenTitle}>Mis favoritos</Text>

          <EmptyFavoritesHero goMarkets={goMarkets} />

          <FavoritesSuggestionsSection
            suggestions={suggestions}
            suggestQuery={suggestQuery}
            onPressAsset={onPressAsset}
            topInset={spacing.lg}
          />

          <FavoritesQuickTipsSection goMarkets={goMarkets} goAlerts={goAlerts} />
        </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (query.isPending && !query.data) {
    const skelRows = Math.min(Math.max(fsyms.length, 4), 10);
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.pad, styles.listContentGrow]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FavoritesListInitialSkeleton rowCount={skelRows} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (query.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <View style={styles.centered}>
          <ErrorCallout
            title="No pudimos cargar precios"
            message="Puede ser un fallo temporal de la red o del servicio. Reintentá en unos segundos."
            onRetry={() => void query.refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const list = query.data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppTopBar />
      <View style={styles.fill}>
        {showFavListSkelOverlay ? (
          <View style={styles.refreshSkelLayer} pointerEvents="none">
            <ScrollView
              style={styles.fill}
              contentContainerStyle={styles.refreshSkelScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FavoritesListInitialSkeleton
                rowCount={Math.min(Math.max(list.length, 4), 10)}
                showFooter
              />
            </ScrollView>
          </View>
        ) : null}
        <FlashList
          style={styles.fill}
          extraData={`${listPullRefreshUi}-${query.dataUpdatedAt}-${suggestQuery.dataUpdatedAt}`}
          data={list}
          renderItem={({ item }) => (
            <CryptoRow asset={item} onPress={() => onPressAsset(item)} />
          )}
          keyExtractor={(item) => item.fsym}
          contentContainerStyle={[styles.listContent, styles.listContentGrow]}
          refreshControl={
            <RefreshControl
              refreshing={listPullRefreshUi}
              onRefresh={onRefreshFavsAndSuggest}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            <Text style={[styles.favScreenTitle, styles.favListTitleOnly]}>Mis favoritos</Text>
          }
          ListEmptyComponent={
            query.isPending ? null : (
              <View style={styles.listEmptyBlock}>
                <EmptyFavoritesHero goMarkets={goMarkets} />
              </View>
            )
          }
          ListFooterComponent={
            <View style={styles.listFooterStack}>
              <FavoritesSuggestionsSection
                suggestions={suggestions}
                suggestQuery={suggestQuery}
                onPressAsset={onPressAsset}
                topInset={spacing.lg}
              />
              <FavoritesQuickTipsSection goMarkets={goMarkets} goAlerts={goAlerts} />
            </View>
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
  emptyHero: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: spacing.xl,
    overflow: "hidden",
    ...cardShadow,
  },
  emptyIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: spacing.lg,
    color: colors.onSurface,
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    alignSelf: "stretch",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  primaryCtaPressed: {
    opacity: 0.92,
  },
  primaryCtaTxt: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  suggestSectionRoot: {
    alignSelf: "stretch",
    marginBottom: spacing.sm,
  },
  suggestBlock: {
    marginBottom: spacing.base,
  },
  suggestHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestTitle: {
    flex: 1,
    ...typography.headlineMd,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: colors.primary,
    fontWeight: "800",
  },
  suggestPill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: "rgba(35, 99, 145, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(35, 99, 145, 0.35)",
    marginBottom: spacing.sm,
  },
  suggestPillTxt: {
    ...typography.caption,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.primary,
    textTransform: "uppercase",
  },
  suggestErr: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  suggestRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.base,
    paddingRight: spacing.lg,
  },
  suggestRowAlign: {
    alignItems: "center",
  },
  suggestCard: {
    width: 200,
    minHeight: 96,
    alignSelf: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: "hidden",
    ...cardShadow,
  },
  suggestCardPressed: {
    opacity: 0.94,
    borderColor: colors.primary,
  },
  suggestRowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestThumbWrap: {
    marginRight: 2,
  },
  suggestThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  suggestPh: {
    alignItems: "center",
    justifyContent: "center",
  },
  suggestPhTxt: {
    ...typography.headlineMd,
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
  },
  suggestMid: {
    flex: 1,
    minWidth: 0,
  },
  suggestNameMain: {
    ...typography.labelMd,
    fontSize: 15,
    lineHeight: 20,
    color: colors.onSurface,
    fontWeight: "700",
  },
  suggestSymSub: {
    textTransform: "uppercase",
    marginTop: 2,
    color: colors.onSurfaceVariant,
  },
  suggestPrice: {
    fontSize: 17,
    lineHeight: 24,
    fontVariant: ["tabular-nums"],
    color: colors.onSurface,
    fontWeight: "700",
    textAlign: "right",
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
  tipsSection: {
    alignSelf: "stretch",
  },
  tipsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsSectionTitle: {
    ...typography.headlineMd,
    flex: 1,
    fontSize: 20,
    lineHeight: 26,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...cardShadow,
  },
  tipRowPressed: {
    opacity: 0.94,
    borderColor: colors.primary,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tipTextCol: {
    flex: 1,
    minWidth: 0,
  },
  tipRowTitle: {
    ...typography.labelMd,
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
});
