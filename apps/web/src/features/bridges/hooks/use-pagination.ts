import { useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

interface UsePaginationOptions {
  pageSize?: number;
}

interface UsePaginationResult<T> {
  page: number;
  totalPages: number;
  pageSize: number;
  setPage: (page: number) => void;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  pageItems: T[];
  /** 1-based index of the first item on the current page. */
  startIndex: number;
  /** 1-based index of the last item on the current page. */
  endIndex: number;
  /** Ordered list of page numbers and "ellipsis" sentinels for rendering. */
  visiblePages: Array<number | "ellipsis">;
}

/**
 * Client-side pagination over a pre-fetched array.
 *
 * Automatically clamps the active page when `items` changes (e.g. live
 * data refresh), so callers never see an empty out-of-range page.
 */
export function usePagination<T>(
  items: T[],
  { pageSize = DEFAULT_PAGE_SIZE }: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const [page, setPageState] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Derived — keeps page in range without triggering an extra render cycle.
  const clampedPage = Math.min(page, totalPages);

  const setPage = (next: number) => {
    setPageState(Math.max(1, Math.min(next, totalPages)));
  };

  const startIndex = (clampedPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, items.length);

  const pageItems = useMemo(
    () => items.slice(startIndex, endIndex),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, startIndex, pageSize]
  );

  const visiblePages = useMemo(
    () => buildPageWindow(clampedPage, totalPages),
    [clampedPage, totalPages]
  );

  return {
    page: clampedPage,
    totalPages,
    pageSize,
    setPage,
    hasPrevPage: clampedPage > 1,
    hasNextPage: clampedPage < totalPages,
    pageItems,
    startIndex,
    endIndex,
    visiblePages,
  };
}

/**
 * Builds the ordered sequence of page numbers (and ellipsis sentinels) to
 * display in a pagination nav. Always includes the first two and last two
 * pages plus a window of ±1 around the current page.
 */
function buildPageWindow(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const candidates = new Set(
    [1, 2, current - 1, current, current + 1, total - 1, total].filter((p) => p >= 1 && p <= total)
  );
  const sorted = Array.from(candidates).sort((a, b) => a - b);

  const pages: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) {
      pages.push("ellipsis");
    }
    pages.push(sorted[i]!);
  }
  return pages;
}
