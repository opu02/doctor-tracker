"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/data/page-header";
import { SearchInput } from "@/components/data/search-input";
import { DoctorForm } from "@/components/doctors/doctor-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Td, TableSkeleton, TableWrap, Th, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useDeleteDoctor, useDoctorFilters, useDoctors } from "@/hooks/use-doctors";
import { useClampPage, useListParams } from "@/hooks/use-list-params";
import { SORT_OPTIONS } from "@/lib/constants";
import type { Doctor } from "@/lib/types";
import { cn, formatDate, initials, rangeEnd, rangeStart } from "@/lib/utils";

const FILTER_KEYS = ["search", "specialization", "hospital", "from", "to"];

function DoctorsContent() {
  const toast = useToast();
  const { get, set, hasFilters, clear, page, limit } = useListParams(FILTER_KEYS);
  const [editing, setEditing] = useState<Doctor | "new" | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);

  const filters = useDoctorFilters();
  const query = useDoctors({
    page,
    limit,
    search: get("search") || undefined,
    specialization: get("specialization") || undefined,
    hospital: get("hospital") || undefined,
    from: rangeStart(get("from")),
    to: rangeEnd(get("to")),
    sort: get("sort", "newest"),
  });
  const deleteDoctor = useDeleteDoctor();

  useClampPage(query.data?.meta, page, (next) => set({ page: next }));

  const doctors = query.data?.data ?? [];

  const confirmDelete = () => {
    if (!deleting) return;
    deleteDoctor.mutate(deleting._id, {
      onSuccess: (result) => {
        const removed = result.data.deletedPatients;
        toast.success(`${deleting.name} deleted${removed ? ` along with ${removed} patients` : ""}`);
        setDeleting(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description="Search, filter and manage every doctor and see their patients."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden /> Add doctor
          </Button>
        }
      />

      <Card>
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <SearchInput
              value={get("search")}
              onSearch={(value) => set({ search: value })}
              placeholder="Name, specialization, hospital, email or phone"
            />
          </div>
          <Select label="Specialization" value={get("specialization")} onChange={(e) => set({ specialization: e.target.value })}>
            <option value="">All specializations</option>
            {filters.data?.specializations.map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Select label="Hospital" value={get("hospital")} onChange={(e) => set({ hospital: e.target.value })}>
            <option value="">All hospitals</option>
            {filters.data?.hospitals.map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Input label="Added from" type="date" value={get("from")} max={get("to") || undefined} onChange={(e) => set({ from: e.target.value })} />
          <Input label="Added to" type="date" value={get("to")} min={get("from") || undefined} onChange={(e) => set({ to: e.target.value })} />
          <Select label="Sort by" value={get("sort", "newest")} onChange={(e) => set({ sort: e.target.value })}>
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
          <div className="flex items-end">
            <Button variant="secondary" className="w-full" onClick={clear} disabled={!hasFilters}>
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
        ) : doctors.length === 0 ? (
          hasFilters ? (
            <EmptyState
              title="No doctors match your filters"
              description="Try a different search term or clear the filters."
              action={<Button variant="secondary" size="sm" onClick={clear}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              title="No doctors yet"
              description="Add your first doctor to get started."
              action={<Button size="sm" onClick={() => setEditing("new")}>Add doctor</Button>}
            />
          )
        ) : (
          <div className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Doctor</Th>
                  <Th>Specialization</Th>
                  <Th className="hidden lg:table-cell">Hospital</Th>
                  <Th className="hidden xl:table-cell">Phone</Th>
                  <Th className="text-center">Patients</Th>
                  <Th className="hidden md:table-cell">Added</Th>
                  <Th className="text-right"><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <Tr key={doctor._id}>
                    <Td>
                      <Link href={`/doctors/${doctor._id}`} className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                          {initials(doctor.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-900 hover:text-brand-700">{doctor.name}</span>
                          <span className="block truncate text-xs text-slate-500">{doctor.email}</span>
                        </span>
                      </Link>
                    </Td>
                    <Td><Badge tone="blue">{doctor.specialization}</Badge></Td>
                    <Td className="hidden max-w-[220px] truncate lg:table-cell">{doctor.hospital}</Td>
                    <Td className="hidden whitespace-nowrap xl:table-cell">{doctor.phone}</Td>
                    <Td className="text-center font-medium text-slate-900">{doctor.patientCount ?? 0}</Td>
                    <Td className="hidden whitespace-nowrap md:table-cell">{formatDate(doctor.createdAt)}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="grid h-8 place-items-center rounded-lg px-3 text-slate-600 hover:bg-slate-100"
                          aria-label={`View ${doctor.name}`}
                        >
                          <Eye className="size-4" />
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(doctor)} aria-label={`Edit ${doctor.name}`}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDeleting(doctor)}
                          aria-label={`Delete ${doctor.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
            {query.data && (
              <Pagination
                meta={query.data.meta}
                noun="doctors"
                onPageChange={(next) => set({ page: next })}
                onLimitChange={(next) => set({ limit: next, page: 1 })}
              />
            )}
          </div>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add doctor" : "Edit doctor"}
        description={editing === "new" ? "Enter the doctor's details." : "Update the doctor's details."}
      >
        <DoctorForm doctor={editing && editing !== "new" ? editing : undefined} onDone={() => setEditing(null)} />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete doctor?"
        description={
          deleting && (
            <>
              <p>
                <span className="font-medium text-slate-900">{deleting.name}</span> will be permanently deleted.
              </p>
              {(deleting.patientCount ?? 0) > 0 && (
                <p className="mt-2 font-medium text-red-600">
                  This also deletes their {deleting.patientCount} patients.
                </p>
              )}
            </>
          )
        }
        loading={deleteDoctor.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense>
      <DoctorsContent />
    </Suspense>
  );
}
