import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageMeta } from "@/lib/types";
import { PAGE_SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";

function pageList(page: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | "…"> = [1];
  if (page > 3) pages.push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p++) pages.push(p);
  if (page < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export function Pagination({
  meta,
  noun,
  onPageChange,
  onLimitChange,
}: {
  meta: PageMeta;
  noun: string;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}) {
  const { page, totalPages, total, limit } = meta;
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const buttonClass =
    "grid h-9 min-w-9 place-items-center rounded-md border px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <p>
          Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{" "}
          <span className="font-medium text-slate-700">{total}</span> {noun}
        </p>
        {onLimitChange && (
          <label className="hidden items-center gap-2 sm:flex">
            <span className="sr-only">Rows per page</span>
            <select
              value={limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          className={cn(buttonClass, "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageList(page, totalPages).map((item, index) =>
          item === "…" ? (
            <span key={`gap-${index}`} className="px-1.5 text-slate-400" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                buttonClass,
                item === page
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          className={cn(buttonClass, "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
