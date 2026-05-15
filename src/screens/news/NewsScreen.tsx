import { FlashList } from "@shopify/flash-list";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppTopBar } from "@/components/layout/AppTopBar";
import { NewsListHeader } from "@/components/news/NewsListHeader";
import { NewsRow } from "@/components/news/NewsRow";
import { NewsFeedSkeleton } from "@/components/news/NewsRowSkeleton";
import { ErrorCallout } from "@/components/ui/ErrorCallout";
import {
  flattenNewsPages,
  useNewsInfiniteQuery,
} from "@/hooks/useNewsInfiniteQuery";
import { useMinDurationActive } from "@/hooks/useMinDurationActive";
import type { NewsStackParamList } from "@/navigation/types";
import { colors, spacing, typography } from "@/theme";

const MIN_SKELETON_UI_MS = 600;
/** Mantiene el spinner del RefreshControl el tiempo mínimo (evita fallos al repetir el gesto en RN/FlashList). */
const MIN_PULL_REFRESH_UI_MS = 480;

type Nav = NativeStackNavigationProp<NewsStackParamList, "NewsHome">;

export function NewsScreen() {
  const navigation = useNavigation<Nav>();
  const query = useNewsInfiniteQuery();
  const [manualPullRefresh, setManualPullRefresh] = useState(false);

  const articles = useMemo(
    () => flattenNewsPages(query.data?.pages),
    [query.data?.pages]
  );

  /**
   * - `isRefetching` excluye `fetchNextPage` (no confundir pull con “cargar más”).
   * - `manualPullRefresh`: el gesto dispara `onRefresh` antes de que TanStack marque `isRefetching`
   *   (y evita depender solo de flags si hay un frame de retraso).
   * - `refreshControl` debe estar memoizado: si se crea `<RefreshControl />` nuevo en cada render,
   *   FlashList recrea el control nativo y el pull deja de funcionar.
   */
  const pullRefreshActive = manualPullRefresh || query.isRefetching;
  const pullRefreshUi = useMinDurationActive(pullRefreshActive, MIN_PULL_REFRESH_UI_MS);
  const showRefreshSkeleton = useMinDurationActive(pullRefreshActive, MIN_SKELETON_UI_MS);
  const showLoadMoreSkeleton = useMinDurationActive(query.isFetchingNextPage, MIN_SKELETON_UI_MS);

  const onRefreshNews = useCallback(async () => {
    setManualPullRefresh(true);
    try {
      await query.refetch();
    } finally {
      setManualPullRefresh(false);
    }
  }, [query]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={pullRefreshUi}
        onRefresh={onRefreshNews}
        tintColor={colors.primary}
        colors={[colors.primary]}
        progressViewOffset={Platform.OS === "android" ? 8 : undefined}
      />
    ),
    [pullRefreshUi, onRefreshNews]
  );

  const onEndReachedNews = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  if (query.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <View style={styles.centered}>
          <ErrorCallout
            title="No pudimos cargar noticias"
            message="Comprobá tu API key de CryptoCompare en el entorno y tu conexión, luego reintentá."
            onRetry={() => void query.refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (query.isPending && !query.data) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={[styles.pendingScroll, styles.listContentGrow]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <NewsFeedSkeleton rowCount={5} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppTopBar />
      <View style={styles.listWrap}>
        {showRefreshSkeleton ? (
          <View style={styles.refreshSkeletonLayer} pointerEvents="none">
            <ScrollView
              style={styles.scrollFlex}
              contentContainerStyle={styles.refreshSkelScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <NewsFeedSkeleton rowCount={4} />
            </ScrollView>
          </View>
        ) : null}
        <FlashList
          style={styles.listFlex}
          extraData={`${query.isFetchingNextPage}-${showLoadMoreSkeleton}-${articles.length}-${pullRefreshUi}`}
          data={articles}
          renderItem={({ item }) => (
            <NewsRow
              article={item}
              onPress={() => navigation.navigate("NewsDetail", { articleId: item.id })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, styles.listContentGrow]}
          refreshControl={refreshControl}
          alwaysBounceVertical
          ListHeaderComponent={NewsListHeader}
          ListFooterComponent={
            showLoadMoreSkeleton ? (
              <View style={styles.footerMore}>
                <View style={styles.footerLoadingRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.footerLoadingTxt}>Cargando más noticias…</Text>
                </View>
              </View>
            ) : null
          }
          onEndReached={onEndReachedNews}
          onEndReachedThreshold={0.55}
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
  listWrap: {
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
  refreshSkelScroll: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  scrollFlex: {
    flex: 1,
  },
  pendingScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
  },
  listFlex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  listContentGrow: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  footerMore: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  footerLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  footerLoadingTxt: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
});
