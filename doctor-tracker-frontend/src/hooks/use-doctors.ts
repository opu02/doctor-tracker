"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Doctor, Paginated, Patient } from "@/lib/types";

type Params = Record<string, string | number | undefined>;

export type DoctorInput = { name: string; specialization: string; hospital: string; phone: string; email: string };
export type PatientInput = {
  name: string;
  age: number;
  gender: string;
  phone: string;
  condition: string;
  admittedDate: string;
};

/** After any write, every list / count / chart that could be affected is refetched. */
export function useInvalidateData() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      ["doctors", "doctor", "doctor-patients", "patients", "doctor-filters", "patient-filters", "doctor-options", "dashboard"].map(
        (key) => queryClient.invalidateQueries({ queryKey: [key] })
      )
    );
}

export function useDoctors(params: Params) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () => api<Paginated<Doctor>>("/doctors", { params }),
    placeholderData: keepPreviousData,
  });
}

export function useDoctorFilters() {
  return useQuery({
    queryKey: ["doctor-filters"],
    queryFn: async () =>
      (await api<{ data: { specializations: string[]; hospitals: string[] } }>("/doctors/filters")).data,
    staleTime: 5 * 60_000,
  });
}

/** Name list for the "doctor" dropdowns (up to 100 doctors). */
export function useDoctorOptions() {
  return useQuery({
    queryKey: ["doctor-options"],
    queryFn: async () => (await api<Paginated<Doctor>>("/doctors", { params: { limit: 100, sort: "name_asc" } })).data,
    staleTime: 5 * 60_000,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => (await api<{ data: Doctor }>(`/doctors/${id}`)).data,
  });
}

export function useDoctorPatients(id: string, params: Params) {
  return useQuery({
    queryKey: ["doctor-patients", id, params],
    queryFn: () => api<Paginated<Patient>>(`/doctors/${id}/patients`, { params }),
    placeholderData: keepPreviousData,
  });
}

export function useSaveDoctor(id?: string) {
  const invalidate = useInvalidateData();
  return useMutation({
    mutationFn: async (input: DoctorInput) =>
      (await api<{ data: Doctor }>(id ? `/doctors/${id}` : "/doctors", { method: id ? "PATCH" : "POST", body: input })).data,
    onSuccess: invalidate,
  });
}

export function useDeleteDoctor() {
  const invalidate = useInvalidateData();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ data: { deletedPatients: number } }>(`/doctors/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

export function useAddDoctorPatient(doctorId: string) {
  const invalidate = useInvalidateData();
  return useMutation({
    mutationFn: async (input: PatientInput) =>
      (await api<{ data: Patient }>(`/doctors/${doctorId}/patients`, { method: "POST", body: input })).data,
    onSuccess: invalidate,
  });
}

export function useRemoveDoctorPatient(doctorId: string) {
  const invalidate = useInvalidateData();
  return useMutation({
    mutationFn: (patientId: string) => api(`/doctors/${doctorId}/patients/${patientId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
