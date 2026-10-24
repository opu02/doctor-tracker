"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Paginated, Patient } from "@/lib/types";
import { PatientInput, useInvalidateData } from "./use-doctors";

type Params = Record<string, string | number | undefined>;

export function usePatients(params: Params) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => api<Paginated<Patient>>("/patients", { params }),
    placeholderData: keepPreviousData,
  });
}

export function usePatientFilters() {
  return useQuery({
    queryKey: ["patient-filters"],
    queryFn: async () => (await api<{ data: { conditions: string[] } }>("/patients/filters")).data.conditions,
    staleTime: 5 * 60_000,
  });
}

export function useUpdatePatient(id: string) {
  const invalidate = useInvalidateData();
  return useMutation({
    mutationFn: async (input: Partial<PatientInput> & { doctorId?: string }) =>
      (await api<{ data: Patient }>(`/patients/${id}`, { method: "PATCH", body: input })).data,
    onSuccess: invalidate,
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidateData();
  return useMutation({
    mutationFn: (id: string) => api(`/patients/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
