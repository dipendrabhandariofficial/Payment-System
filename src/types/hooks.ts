/**
 * Hook return type definitions
 */

export interface UseInfiniteScrollReturn<T> {
  loaderRef: React.RefObject<HTMLDivElement>;
  paginatedItems: T[];
  hasMore: boolean;
  displayCount: number;
}

export interface UseInfiniteScrollOptions<T> {
  items: T[];
  pageSize?: number;
  rootRef?: React.RefObject<HTMLElement>;
}

export interface UseBooleanReturn {
  on: () => void;
  off: () => void;
  toggle: () => void;
  setValue: (val: boolean) => void;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export interface UseLocalStorageReturn<T> {
  value: T | null;
  setValue: (val: T | null) => void;
  removeValue: () => void;
}
