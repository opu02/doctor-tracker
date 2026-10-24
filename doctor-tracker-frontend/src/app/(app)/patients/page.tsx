"use client";

import { Suspense, useState } from "react";
import { X } from "lucide-react";
import { PageHeader } from "@/components/data/page-header";
import { SearchInput } from "@/components/data/search-input";
import { PatientForm } from "@/components/patients/patient-form";
import { PatientsTable } from "@/components/patients/patients-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { TableSkeleton } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useDoctorOptions } from "@/hooks/use-doctors";
import { useClampPage, useListParams } from "@/hooks/use-list-params";
import { useDeletePatient, usePatientFilters, usePatients } from "@/hooks/use-patients";
import { GENDER_OPTIONS, PATIENT_SORT_OPTIONS } from "@/lib/constants";
import type { Patient } from "@/lib/types";
import { cn, rangeEnd, rangeStart } from "@/lib/utils";

const FILTER_KEYS = ["search", "condition", "gender", "doctorId", "from", "to"];

function PatientsContent() {
  const toast = useToast();
  const { get, set, hasFilters, clear, page, limit } = useListParams(FILTER_KEYS);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);

  const conditions = usePatientFilters();
  const doctors = useDoctorOptions();
  const query = usePatients({
    page,
    limit,
    search: get("search") || undefined,
    condition: get("condition") || undefined,
    gender: get("gender") || undefined,
    doctorId: get("doctorId") || undefined,
    from: rangeStart(get("from")),
    to: rangeEnd(get("to")),
    sort: get("sort", "newest"),
  });
  const deletePatient = useDeletePatient();

  useClampPage(query.data?.meta, page, (next) => set({ page: next }));

  const patients = query.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Every patient across all doctors. New patients are added from a doctor's page."
      />

      <Card>
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <SearchInput value={get("search")} onSearch={(value) => set({ search: value })} placeholder="Patient name or phone" />
          </div>
          <Select label="Condition" value={get("condition")} onChange={(e) => set({ condition: e.target.value })}>
            <option value="">All conditions</option>
            {conditions.data?.map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Select label="Doctor" value={get("doctorId")} onChange={(e) => set({ doctorId: e.target.value })}>
            <option value="">All doctors</option>
            {doctors.data?.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>{doctor.name} · {doctor.specialization}</option>
            ))}
          </Select>
          <Select label="Gender" value={get("gender")} onChange={(e) => set({ gender: e.target.value })}>
            <option value="">All genders</option>
            {GENDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
          <Input label="Admitted from" type="date" value={get("from")} max={get("to") || undefined} onChange={(e) => set({ from: e.target.value })} />
          <Input label="Admitted to" type="date" value={get("to")} min={get("from") || undefined} onChange={(e) => set({ to: e.target.value })} />
          <Select label="Sort by" value={get("sort", "newest")} onChange={(e) => set({ sort: e.target.value })}>
            {PATIENT_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
          <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end">
            <Button variant="secondary" onClick={clear} disabled={!hasFilters}>
              <X className="size-4" aria-hidden /> Clear filters
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {query.isPending ? (
          <TableSkeleton columns={5} />
        ) : query.isError ? (
          <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
        ) : patients.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No patients match your filters" : "No patients yet"}
            description={hasFilters ? "Try a different search term or clear the filters." : "Patients are added from a doctor's page."}
            action={hasFilters ? <Button variant="secondary" size="sm" onClick={clear}>Clear filters</Button> : undefined}
          />
        ) : (
          <div className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>
            <PatientsTable patients={patients} showDoctor onEdit={setEditing} onDelete={setDeleting} />
            {query.data && (
              <Pagination
                meta={query.data.meta}
                noun="patients"
                onPageChange={(next) => set({ page: next })}
                onLimitChange={(next) => set({ limit: next, page: 1 })}
              />
            )}
          </div>
        )}
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit patient" description="Update the patient's details or reassign them to another doctor.">
        {editing && <PatientForm mode="edit" patient={editing} onDone={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete patient?"
        description={
          deleting && (
            <p>
              <span className="font-medium text-slate-900">{deleting.name}</span> will be permanently deleted.
            </p>
          )
        }
        loading={deletePatient.isPending}
        onConfirm={() =>
          deleting &&
          deletePatient.mutate(deleting._id, {
            onSuccess: () => {
              toast.success("Patient deleted");
              setDeleting(null);
            },
            onError: (error) => toast.error(error.message),
          })
        }
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsContent />
    </Suspense>
  );
}
