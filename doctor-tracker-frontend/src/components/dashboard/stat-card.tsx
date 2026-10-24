import { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  tone = "brand",
  footer,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: "brand" | "indigo" | "amber" | "sky";
  footer?: ReactNode;
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", tones[tone])} aria-hidden>
          {icon}
        </span>
      </div>
      {footer && <div className="mt-3 text-xs text-slate-500">{footer}</div>}
    </Card>
  );
}

export function Trend({ percent, label }: { percent: number | null; label: string }) {
  if (percent === null) return <span>{label}: no earlier data</span>;
  const up = percent >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium",
          up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        )}
      >
        <Icon className="size-3" aria-hidden />
        {up ? "+" : ""}
        {percent}%
      </span>
      {label}
    </span>
  );
}
