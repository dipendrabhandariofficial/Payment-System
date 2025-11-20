import { useState, useEffect, useRef } from "react";

const useInfiniteScroll = ({ items = [], pageSize = 10 }) => {
  const [displayCount, setDisplayCount] = useState(pageSize);
  const loaderRef = useRef(null);
  const observerRef = useRef(null);

  // Reset display count when items change (e.g., when filters are applied)
  useEffect(() => {
    setDisplayCount(pageSize);
  }, [items.length, pageSize]);

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && displayCount < items.length) {
          setDisplayCount((prev) => Math.min(prev + pageSize, items.length));
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' 
      }
    );

    // Observe the loader element
    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observerRef.current.observe(currentLoader);
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayCount, items.length, pageSize]);

  const paginatedItems = items.slice(0, displayCount);
  const hasMore = displayCount < items.length;

  // Debug info (optional - remove in production)
  useEffect(() => {
    console.log(`Infinite Scroll Debug:`, {
      totalItems: items.length,
      displayCount,
      hasMore,
      pageSize
    });
  }, [displayCount, items.length, hasMore, pageSize]);

  return {
    loaderRef,
    paginatedItems,
    hasMore,
    displayCount,
    totalItems: items.length,
  };
};

export default useInfiniteScroll;