import { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
        className
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-slate-100 px-4 py-3.5 align-middle text-slate-600", className)} {...props} />;
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors hover:bg-slate-50/70", className)} {...props} />;
}

/** Placeholder rows shown while a list loads for the first time. */
export function TableSkeleton({ rows = 6, columns }: { rows?: number; columns: number }) {
  return (
    <TableWrap>
      <tbody aria-busy="true">
        {Array.from({ length: rows }, (_, row) => (
          <tr key={row}>
            {Array.from({ length: columns }, (_, col) => (
              <td key={col} className="border-b border-slate-100 px-4 py-4">
                <Skeleton className="h-5 w-full max-w-[160px]" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );
}
