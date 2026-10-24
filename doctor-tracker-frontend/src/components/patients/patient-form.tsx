"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useAddDoctorPatient, useDoctorOptions } from "@/hooks/use-doctors";
import { usePatientFilters, useUpdatePatient } from "@/hooks/use-patients";
import { BD_PHONE, GENDER_OPTIONS } from "@/lib/constants";
import { applyServerErrors } from "@/lib/form";
import type { Patient } from "@/lib/types";
import { dateInputToIso, todayInput, toDateInput } from "@/lib/utils";
import { zodResolver } from "@/lib/zodResolver";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  age: z
    .string()
    .trim()
    .min(1, "Age is required")
    .refine((value) => /^\d{1,3}$/.test(value) && Number(value) <= 130, "Enter an age between 0 and 130"),
  gender: z.enum(["male", "female", "other"], { error: "Select a gender" }),
  phone: z
    .string()
    .trim()
    .refine((value) => BD_PHONE.test(value.replace(/[\s-]/g, "")), "Enter a valid Bangladesh mobile number (01XXXXXXXXX)"),
  condition: z.string().trim().min(2, "Condition is required").max(120, "Too long"),
  admittedDate: z.string().min(1, "Admission date is required"),
  doctorId: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;
const FIELDS: Array<keyof FormValues> = ["name", "age", "gender", "phone", "condition", "admittedDate", "doctorId"];

type Props = { onDone: () => void } & ({ mode: "create"; doctorId: string } | { mode: "edit"; patient: Patient });

export function PatientForm(props: Props) {
  const toast = useToast();
  const patient = props.mode === "edit" ? props.patient : undefined;
  const add = useAddDoctorPatient(props.mode === "create" ? props.doctorId : "");
  const update = useUpdatePatient(patient?._id ?? "");
  const conditions = usePatientFilters();
  const doctors = useDoctorOptions();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver<FormValues>(schema),
    defaultValues: {
      name: patient?.name ?? "",
      age: patient ? String(patient.age) : "",
      gender: patient?.gender ?? ("" as FormValues["gender"]),
      phone: patient?.phone ?? "",
      condition: patient?.condition ?? "",
      admittedDate: patient ? toDateInput(patient.admittedDate) : todayInput(),
      doctorId: patient?.doctorId ?? "",
    },
  });

  const pending = add.isPending || update.isPending;

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    const payload = {
      name: values.name,
      age: Number(values.age),
      gender: values.gender,
      phone: values.phone,
      condition: values.condition,
      admittedDate: dateInputToIso(values.admittedDate),
    };
    const handlers = {
      onSuccess: () => {
        toast.success(patient ? "Patient updated" : "Patient added");
        props.onDone();
      },
      onError: (error: unknown) => setFormError(applyServerErrors(error, setError, FIELDS)),
    };

    if (patient) update.mutate({ ...payload, ...(values.doctorId ? { doctorId: values.doctorId } : {}) }, handlers);
    else add.mutate(payload, handlers);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {formError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <Input label="Patient name" placeholder="e.g. Nusrat Akter" autoComplete="off" error={errors.name?.message} {...register("name")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Age" inputMode="numeric" placeholder="e.g. 34" error={errors.age?.message} {...register("age")} />
        <Select label="Gender" error={errors.gender?.message} {...register("gender")}>
          <option value="">Select…</option>
          {GENDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Phone" type="tel" placeholder="01XXXXXXXXX" error={errors.phone?.message} {...register("phone")} />
        <Input
          label="Condition"
          placeholder="e.g. Asthma"
          list="condition-options"
          error={errors.condition?.message}
          {...register("condition")}
        />
      </div>
      <datalist id="condition-options">
        {conditions.data?.map((item) => <option key={item} value={item} />)}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Admission date" type="date" max={todayInput()} error={errors.admittedDate?.message} {...register("admittedDate")} />
        {props.mode === "edit" && (
          <Select label="Doctor" error={errors.doctorId?.message} {...register("doctorId")}>
            {doctors.data?.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} · {doctor.specialization}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={props.onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          {patient ? "Save changes" : "Add patient"}
        </Button>
      </div>
    </form>
  );
}
