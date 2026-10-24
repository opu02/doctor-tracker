"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_COLOR, CHART_COLORS, GRID_COLOR } from "@/lib/chart";
import type { DashboardSummary, NameCount } from "@/lib/types";
import { formatDayKey, number } from "@/lib/utils";

function TooltipBox({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-900">{title}</p>
      {lines.map((line) => (
        <p key={line} className="mt-0.5 text-slate-600">
          {line}
        </p>
      ))}
    </div>
  );
}

export function PatientsOverTimeChart({ data }: { data: DashboardSummary["patientsOverTime"] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Area chart of patients admitted per day">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="patientsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDayKey}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke={AXIS_COLOR}
            minTickGap={28}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke={AXIS_COLOR} width={44} />
          <Tooltip
            cursor={{ stroke: GRID_COLOR }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as { date: string; count: number } | undefined;
              if (!active || !point) return null;
              return <TooltipBox title={formatDayKey(point.date)} lines={[`${point.count} patients admitted`]} />;
            }}
          />
          <Area type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} fill="url(#patientsGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PatientsPerDoctorChart({ data }: { data: DashboardSummary["patientsPerDoctor"] }) {
  const byId = new Map(data.map((row) => [row.doctorId, row]));
  const short = (id: string) => {
    const name = byId.get(id)?.name ?? "";
    return name.length > 15 ? `${name.slice(0, 14)}…` : name;
  };

  return (
    <div
      className="w-full"
      style={{ height: Math.max(data.length * 34 + 24, 120) }}
      role="img"
      aria-label="Bar chart of patients per doctor"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke={AXIS_COLOR} />
          <YAxis
            type="category"
            dataKey="doctorId"
            width={104}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke={AXIS_COLOR}
            tickFormatter={short}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as DashboardSummary["patientsPerDoctor"][number] | undefined;
              if (!active || !row) return null;
              return <TooltipBox title={row.name} lines={[row.specialization, `${row.patients} patients`]} />;
            }}
          />
          <Bar dataKey="patients" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data, label }: { data: NameCount[]; label: string }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative size-44 shrink-0" role="img" aria-label={`Donut chart: ${label}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((item, index) => (
                <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                const item = payload?.[0]?.payload as NameCount | undefined;
                if (!active || !item) return null;
                const percent = total ? Math.round((item.count / total) * 100) : 0;
                return <TooltipBox title={item.name} lines={[`${item.count} patients (${percent}%)`]} />;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xl font-semibold text-slate-900">{number(total)}</p>
            <p className="text-[11px] text-slate-500">{label}</p>
          </div>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2 text-sm">
        {data.map((item, index) => (
          <li key={item.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-slate-600">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                aria-hidden
              />
              <span className="truncate capitalize">{item.name}</span>
            </span>
            <span className="font-medium text-slate-900">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SpecializationBars({ data }: { data: NameCount[] }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <ul className="space-y-3">
      {data.map((item) => (
        <li key={item.name}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-slate-600">{item.name}</span>
            <span className="font-medium text-slate-900">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="presentation">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
