"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, Mail, Pencil, Phone, Plus, Trash2, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/data/page-header";
import { SearchInput } from "@/components/data/search-input";
import { DoctorForm } from "@/components/doctors/doctor-form";
import { PatientForm } from "@/components/patients/patient-form";
import { PatientsTable } from "@/components/patients/patients-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { TableSkeleton } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useDeleteDoctor, useDoctor, useDoctorPatients, useRemoveDoctorPatient } from "@/hooks/use-doctors";
import { useClampPage, useListParams } from "@/hooks/use-list-params";
import { usePatientFilters } from "@/hooks/use-patients";
import { ApiError } from "@/lib/api";
import { PATIENT_SORT_OPTIONS } from "@/lib/constants";
import type { Patient } from "@/lib/types";
import { cn, formatDate, initials } from "@/lib/utils";

const FILTER_KEYS = ["search", "condition"];

function Info({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-slate-600">
      <Icon className="size-4 shrink-0 text-slate-400" aria-hidden />
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { get, set, hasFilters, clear, page, limit } = useListParams(FILTER_KEYS);

  const doctor = useDoctor(id);
  const conditions = usePatientFilters();
  const patients = useDoctorPatients(id, {
    page,
    limit,
    search: get("search") || undefined,
    condition: get("condition") || undefined,
    sort: get("sort", "newest"),
  });
  const removePatient = useRemoveDoctorPatient(id);
  const deleteDoctor = useDeleteDoctor();

  const [editingDoctor, setEditingDoctor] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);
  const [removing, setRemoving] = useState<Patient | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState(false);

  useClampPage(patients.data?.meta, page, (next) => set({ page: next }));

  if (doctor.isPending) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (doctor.isError) {
    const notFound = doctor.error instanceof ApiError && (doctor.error.status === 404 || doctor.error.status === 400);
    return (
      <Card>
        {notFound ? (
          <EmptyState
            title="Doctor not found"
            description="This doctor may have been deleted."
            action={<Link href="/doctors" className="text-sm font-medium text-brand-700 hover:underline">Back to doctors</Link>}
          />
        ) : (
          <ErrorState message={doctor.error.message} onRetry={() => doctor.refetch()} />
        )}
      </Card>
    );
  }

  const info = doctor.data;
  const list = patients.data?.data ?? [];

  return (
    <div className="space-y-6">
      <Link href="/doctors" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden /> All doctors
      </Link>

      <Card>
        <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700">
              {initials(info.name)}
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-900">{info.name}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge tone="blue">{info.specialization}</Badge>
                <Badge>{info.patientCount ?? 0} patients</Badge>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-x-8">
                <Info icon={Building2}>{info.hospital}</Info>
                <Info icon={Phone}>{info.phone}</Info>
                <Info icon={Mail}>{info.email}</Info>
                <Info icon={CalendarDays}>Added {formatDate(info.createdAt)}</Info>
              </ul>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" onClick={() => setEditingDoctor(true)}>
              <Pencil className="size-4" aria-hidden /> Edit
            </Button>
            <Button variant="secondary" className="text-red-600 hover:bg-red-50" onClick={() => setDeletingDoctor(true)}>
              <Trash2 className="size-4" aria-hidden /> Delete
            </Button>
          </div>
        </CardBody>
      </Card>

      <PageHeader
        title="Patients"
        description={`Patients under ${info.name}`}
        actions={
          <Button onClick={() => setAddingPatient(true)}>
            <Plus className="size-4" aria-hidden /> Add patient
          </Button>
        }
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
          <Select label="Sort by" value={get("sort", "newest")} onChange={(e) => set({ sort: e.target.value })}>
            {PATIENT_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {patients.isPending ? (
          <TableSkeleton columns={4} />
        ) : patients.isError ? (
          <ErrorState message={patients.error.message} onRetry={() => patients.refetch()} />
        ) : list.length === 0 ? (
          hasFilters ? (
            <EmptyState
              title="No patients match your filters"
              action={<Button variant="secondary" size="sm" onClick={clear}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              title="No patients yet"
              description={`${info.name} has no patients. Add the first one.`}
              action={
                <Button size="sm" onClick={() => setAddingPatient(true)}>
                  <UserPlus className="size-4" aria-hidden /> Add patient
                </Button>
              }
            />
          )
        ) : (
          <div className={cn("transition-opacity", patients.isPlaceholderData && "opacity-60")}>
            <PatientsTable patients={list} onDelete={setRemoving} />
            {patients.data && (
              <Pagination
                meta={patients.data.meta}
                noun="patients"
                onPageChange={(next) => set({ page: next })}
                onLimitChange={(next) => set({ limit: next, page: 1 })}
              />
            )}
          </div>
        )}
      </Card>

      <Modal open={editingDoctor} onClose={() => setEditingDoctor(false)} title="Edit doctor">
        <DoctorForm doctor={info} onDone={() => setEditingDoctor(false)} />
      </Modal>

      <Modal
        open={addingPatient}
        onClose={() => setAddingPatient(false)}
        title="Add patient"
        description={`New patient under ${info.name}`}
      >
        <PatientForm mode="create" doctorId={id} onDone={() => setAddingPatient(false)} />
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="Remove patient?"
        confirmLabel="Remove"
        description={
          removing && (
            <p>
              <span className="font-medium text-slate-900">{removing.name}</span> will be removed from {info.name}&apos;s patient list.
            </p>
          )
        }
        loading={removePatient.isPending}
        onConfirm={() =>
          removing &&
          removePatient.mutate(removing._id, {
            onSuccess: () => {
              toast.success("Patient removed");
              setRemoving(null);
            },
            onError: (error) => toast.error(error.message),
          })
        }
        onClose={() => setRemoving(null)}
      />

      <ConfirmDialog
        open={deletingDoctor}
        title="Delete doctor?"
        description={
          <>
            <p>
              <span className="font-medium text-slate-900">{info.name}</span> will be permanently deleted.
            </p>
            {(info.patientCount ?? 0) > 0 && (
              <p className="mt-2 font-medium text-red-600">This also deletes their {info.patientCount} patients.</p>
            )}
          </>
        }
        loading={deleteDoctor.isPending}
        onConfirm={() =>
          deleteDoctor.mutate(id, {
            onSuccess: () => {
              toast.success(`${info.name} deleted`);
              router.replace("/doctors");
            },
            onError: (error) => toast.error(error.message),
          })
        }
        onClose={() => setDeletingDoctor(false)}
      />
    </div>
  );
}

export default function DoctorDetailPage() {
  return (
    <Suspense>
      <DoctorDetail />
    </Suspense>
  );
}
