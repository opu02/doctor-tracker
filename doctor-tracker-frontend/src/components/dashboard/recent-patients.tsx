import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import type { Patient } from "@/lib/types";
import { formatDate, initials } from "@/lib/utils";

export function RecentPatients({ patients }: { patients: Patient[] }) {
  if (patients.length === 0) return <EmptyState title="No patients yet" />;

  return (
    <ul className="divide-y divide-slate-100">
      {patients.map((patient) => (
        <li key={patient._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {initials(patient.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{patient.name}</p>
            <p className="truncate text-xs text-slate-500">
              {patient.doctor ? (
                <Link href={`/doctors/${patient.doctor._id}`} className="hover:text-brand-700 hover:underline">
                  {patient.doctor.name}
                </Link>
              ) : (
                "Unassigned"
              )}
              {" · "}
              {formatDate(patient.admittedDate)}
            </p>
          </div>
          <Badge tone="brand" className="shrink-0">
            {patient.condition}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
