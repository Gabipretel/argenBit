import { useEffect, type RefObject } from "react";

type ScrollableList = {
  scrollToEnd: (options?: { animated?: boolean }) => void;
};

/** Al paginar, desplaza la lista al footer para que el loader “cargando más” quede visible. */
export function useScrollListToEndOnLoadMore(
  listRef: RefObject<ScrollableList | null>,
  isLoadingMore: boolean
) {
  useEffect(() => {
    if (!isLoadingMore) return;

    const frameId = requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });

    return () => cancelAnimationFrame(frameId);
  }, [isLoadingMore, listRef]);
}
