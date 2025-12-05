import { useState, useEffect, useRef, useMemo } from "react";

interface UseInfiniteScrollOptions<T> {
  items: T[];
  pageSize?: number;
  rootElement?: HTMLElement | null;
}

interface UseInfiniteScrollReturn<T> {
  paginatedItems: T[];
  hasMore: boolean;
  loaderRef: React.RefObject<HTMLDivElement | null>;
  loadMore: () => void;
}

export const useInfiniteScroll = <T>({
  items,
  pageSize = 10,
  rootElement = null,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> => {
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset page when items change (e.g., filtering)
  useEffect(() => {
    setPage(1);
  }, [items]);

  const paginatedItems = useMemo(() => {
    return items.slice(0, page * pageSize);
  }, [items, page, pageSize]);

  const hasMore = paginatedItems.length < items.length;

  const loadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
          loadMore();
        }
      },
      {
        root: rootElement,
        threshold: 0.1,
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, rootElement]);

  return {
    paginatedItems,
    hasMore,
    loaderRef,
    loadMore,
  };
};

export default useInfiniteScroll;
