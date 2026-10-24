"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PageMeta } from "@/lib/types";

type Patch = Record<string, string | number | null | undefined>;

/**
 * Keeps list state (search, filters, sort, page) in the URL, so lists are shareable,
 * survive a refresh and work with the browser's back button.
 */
export function useListParams(filterKeys: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback((key: string, fallback = "") => searchParams.get(key) ?? fallback, [searchParams]);

  const set = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      // any filter change goes back to page 1, unless the page itself is being changed
      if (!("page" in patch)) next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const hasFilters = filterKeys.some((key) => Boolean(searchParams.get(key)));
  const clear = useCallback(() => set(Object.fromEntries(filterKeys.map((key) => [key, null]))), [set, filterKeys]);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Number(searchParams.get("limit")) || 10;

  return { get, set, hasFilters, clear, page, limit };
}

/** If the current page no longer exists (e.g. the last row of the last page was deleted), go back. */
export function useClampPage(meta: PageMeta | undefined, page: number, setPage: (page: number) => void) {
  useEffect(() => {
    if (meta && page > meta.totalPages) setPage(meta.totalPages);
  }, [meta, page, setPage]);
}
