import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Td, TableWrap, Th, Tr } from "@/components/ui/table";
import type { Patient } from "@/lib/types";
import { formatDate, initials } from "@/lib/utils";

export function PatientsTable({
  patients,
  showDoctor,
  onEdit,
  onDelete,
}: {
  patients: Patient[];
  showDoctor?: boolean;
  onEdit?: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}) {
  return (
    <TableWrap>
      <thead>
        <tr>
          <Th>Patient</Th>
          <Th className="hidden sm:table-cell">Age / Gender</Th>
          <Th>Condition</Th>
          {showDoctor && <Th className="hidden lg:table-cell">Doctor</Th>}
          <Th className="hidden md:table-cell">Admitted</Th>
          <Th className="text-right">
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <Tr key={patient._id}>
            <Td>
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {initials(patient.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{patient.name}</p>
                  <p className="truncate text-xs text-slate-500">{patient.phone}</p>
                </div>
              </div>
            </Td>
            <Td className="hidden whitespace-nowrap sm:table-cell">
              {patient.age} yrs · <span className="capitalize">{patient.gender}</span>
            </Td>
            <Td>
              <Badge tone="brand">{patient.condition}</Badge>
            </Td>
            {showDoctor && (
              <Td className="hidden lg:table-cell">
                {patient.doctor ? (
                  <Link href={`/doctors/${patient.doctor._id}`} className="font-medium text-slate-700 hover:text-brand-700 hover:underline">
                    {patient.doctor.name}
                    <span className="block text-xs font-normal text-slate-500">{patient.doctor.specialization}</span>
                  </Link>
                ) : (
                  "—"
                )}
              </Td>
            )}
            <Td className="hidden whitespace-nowrap md:table-cell">{formatDate(patient.admittedDate)}</Td>
            <Td>
              <div className="flex justify-end gap-1">
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(patient)} aria-label={`Edit ${patient.name}`}>
                    <Pencil className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(patient)}
                  aria-label={`Delete ${patient.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Td>
          </Tr>
        ))}
      </tbody>
    </TableWrap>
  );
}
