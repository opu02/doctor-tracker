"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardSummary } from "@/lib/types";

export type RangeDays = 7 | 30 | 90;

export function useDashboard(days: RangeDays) {
  return useQuery({
    queryKey: ["dashboard", days],
    queryFn: async () => (await api<{ data: DashboardSummary }>("/dashboard/summary", { params: { days } })).data,
    placeholderData: keepPreviousData, // keep showing the old range while the new one loads
  });
}
