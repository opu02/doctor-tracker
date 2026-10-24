"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarPlus, Stethoscope, UserRound, Users } from "lucide-react";
import { DonutChart, PatientsOverTimeChart, PatientsPerDoctorChart, SpecializationBars } from "@/components/dashboard/charts";
import { RecentPatients } from "@/components/dashboard/recent-patients";
import { StatCard, Trend } from "@/components/dashboard/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { RangeDays, useDashboard } from "@/hooks/use-dashboard";
import { cn, number } from "@/lib/utils";

const RANGES: RangeDays[] = [7, 30, 90];

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [days, setDays] = useState<RangeDays>(30);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDashboard(days);

  if (isPending) return <DashboardSkeleton />;
  if (isError) {
    return (
      <Card>
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </Card>
    );
  }

  const { totals } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Clinic overview</h2>
          <p className="text-sm text-slate-500">Patients admitted in the last {days} days compared with the {days} days before.</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm" role="group" aria-label="Date range">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              aria-pressed={days === range}
              onClick={() => setDays(range)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                days === range ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {range} days
            </button>
          ))}
        </div>
      </div>

      <div className={cn("space-y-6 transition-opacity", isPlaceholderData && "opacity-60")}>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0" aria-label="Key numbers">
          <StatCard label="Total doctors" value={number(totals.doctors)} icon={<Stethoscope className="size-5" />} />
          <StatCard
            label="Total patients"
            value={number(totals.patients)}
            icon={<Users className="size-5" />}
            tone="indigo"
          />
          <StatCard
            label={`New patients (${days} days)`}
            value={number(totals.patientsInRange)}
            icon={<CalendarPlus className="size-5" />}
            tone="amber"
            footer={<Trend percent={totals.changePercent} label="vs previous period" />}
          />
          <StatCard
            label="Avg. patients per doctor"
            value={totals.averagePatientsPerDoctor}
            icon={<UserRound className="size-5" />}
            tone="sky"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
          <Card className="lg:col-span-2">
            <CardHeader title="Patient admissions" description={`Admitted per day, last ${days} days`} />
            <CardBody>
              <PatientsOverTimeChart data={data.patientsOverTime} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Top conditions" description="Most common diagnoses" />
            <CardBody>
              <DonutChart data={data.conditions} label="patients" />
            </CardBody>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
          <Card className="lg:col-span-2">
            <CardHeader title="Patients per doctor" description="Top 10 doctors by number of patients" />
            <CardBody>
              <PatientsPerDoctorChart data={data.patientsPerDoctor} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Gender split" description="All patients" />
            <CardBody>
              <DonutChart data={data.gender} label="patients" />
            </CardBody>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
          <Card>
            <CardHeader title="Doctors by specialization" />
            <CardBody>
              <SpecializationBars data={data.specializations} />
            </CardBody>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader
              title="Recent admissions"
              description="Latest patients added"
              action={
                <Link href="/patients" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                  View all <ArrowRight className="size-4" aria-hidden />
                </Link>
              }
            />
            <CardBody>
              <RecentPatients patients={data.recentPatients} />
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}
