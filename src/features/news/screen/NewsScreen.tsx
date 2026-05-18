import { FlashList, type FlashListRef } from "@shopify/flash-list";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useCallback, useRef, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppListLoadMoreIndicator,
  AppTopBar,
  ErrorCallout,
  LIST_PAGINATION_END_THRESHOLD,
  MIN_LIST_LOAD_MORE_VISIBLE_MS,
  useMinDurationActive,
  useScrollListToEndOnLoadMore,
} from "@/common";
import type { NewsArticle } from "@/domain/models/NewsArticle";
import { NewsFeedSkeleton } from "../components/NewsRowSkeleton";
import { NewsListHeader } from "../components/NewsListHeader";
import { NewsRow } from "../components/NewsRow";
import { flattenNewsPages, useNewsInfiniteQuery } from "../hooks/useNewsInfiniteQuery";
import { env } from "@/core/config/env";
import type { NewsStackParamList } from "@/core/navigation/types";
import { colors, spacing } from "@/core/theme";

const MIN_SKELETON_UI_MS = 600;
/** Mantiene el spinner del RefreshControl el tiempo mínimo (evita fallos al repetir el gesto en RN/FlashList). */
const MIN_PULL_TO_REFRESH_SPINNER_MS = 480;

type Nav = NativeStackNavigationProp<NewsStackParamList, "NewsHome">;

export function NewsScreen() {
  const navigation = useNavigation<Nav>();
  const query = useNewsInfiniteQuery();
  const listRef = useRef<FlashListRef<NewsArticle>>(null);
  const [manualPullRefresh, setManualPullRefresh] = useState(false);

  const articles = useMemo(
    () => flattenNewsPages(query.data?.pages),
    [query.data?.pages]
  );

  const isPullToRefreshActive = manualPullRefresh || query.isRefetching;
  const showPullRefreshSpinner = useMinDurationActive(
    isPullToRefreshActive,
    MIN_PULL_TO_REFRESH_SPINNER_MS
  );
  const showRefreshSkeleton = useMinDurationActive(isPullToRefreshActive, MIN_SKELETON_UI_MS);
  const showLoadMoreSkeleton = useMinDurationActive(
    query.isFetchingNextPage,
    MIN_LIST_LOAD_MORE_VISIBLE_MS
  );

  useScrollListToEndOnLoadMore(listRef, showLoadMoreSkeleton);

  const refreshNewsFeed = useCallback(async () => {
    setManualPullRefresh(true);
    try {
      await query.refetch();
    } finally {
      setManualPullRefresh(false);
    }
  }, [query]);

  const newsListRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={showPullRefreshSpinner}
        onRefresh={refreshNewsFeed}
        tintColor={colors.primary}
        colors={[colors.primary]}
        progressViewOffset={Platform.OS === "android" ? 8 : undefined}
      />
    ),
    [showPullRefreshSpinner, refreshNewsFeed]
  );

  const loadMoreNewsArticles = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  if (query.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <View style={styles.centered}>
          <ErrorCallout
            title="Noticias no disponibles"
            message="Por el momento no se encuentran disponibles las noticias. Por favor, inténtelo más tarde."
            onRetry={() => query.refetch()}
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
          ref={listRef}
          style={styles.listFlex}
          extraData={`${query.isFetchingNextPage}-${showLoadMoreSkeleton}-${articles.length}-${showPullRefreshSpinner}`}
          data={articles}
          renderItem={({ item }) => (
            <NewsRow
              article={item}
              onPress={() => navigation.navigate("NewsDetail", { articleId: item.id })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, styles.listContentGrow]}
          refreshControl={newsListRefreshControl}
          alwaysBounceVertical
          ListHeaderComponent={NewsListHeader}
          ListFooterComponent={
            showLoadMoreSkeleton ? (
              <View style={styles.footerMore}>
                <AppListLoadMoreIndicator message="Cargando más noticias…" />
              </View>
            ) : null
          }
          onEndReached={loadMoreNewsArticles}
          onEndReachedThreshold={LIST_PAGINATION_END_THRESHOLD}
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
});
