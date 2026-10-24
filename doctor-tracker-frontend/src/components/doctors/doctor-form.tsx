"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useDoctorFilters, useSaveDoctor } from "@/hooks/use-doctors";
import { BD_PHONE } from "@/lib/constants";
import { applyServerErrors } from "@/lib/form";
import type { Doctor } from "@/lib/types";
import { zodResolver } from "@/lib/zodResolver";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  specialization: z.string().trim().min(2, "Specialization is required").max(80, "Too long"),
  hospital: z.string().trim().min(2, "Hospital is required").max(120, "Too long"),
  phone: z
    .string()
    .trim()
    .refine((value) => BD_PHONE.test(value.replace(/[\s-]/g, "")), "Enter a valid Bangladesh mobile number (01XXXXXXXXX)"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;
const FIELDS: Array<keyof FormValues> = ["name", "specialization", "hospital", "phone", "email"];

export function DoctorForm({ doctor, onDone }: { doctor?: Doctor; onDone: () => void }) {
  const toast = useToast();
  const save = useSaveDoctor(doctor?._id);
  const filters = useDoctorFilters();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver<FormValues>(schema),
    defaultValues: {
      name: doctor?.name ?? "",
      specialization: doctor?.specialization ?? "",
      hospital: doctor?.hospital ?? "",
      phone: doctor?.phone ?? "",
      email: doctor?.email ?? "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(values, {
      onSuccess: () => {
        toast.success(doctor ? "Doctor updated" : "Doctor added");
        onDone();
      },
      onError: (error) => setFormError(applyServerErrors(error, setError, FIELDS)),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {formError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <Input label="Full name" placeholder="e.g. Abdur Rahman" autoComplete="off" error={errors.name?.message} {...register("name")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Specialization"
          placeholder="e.g. Cardiology"
          list="specialization-options"
          error={errors.specialization?.message}
          {...register("specialization")}
        />
        <Input
          label="Hospital"
          placeholder="e.g. Square Hospital, Dhaka"
          list="hospital-options"
          error={errors.hospital?.message}
          {...register("hospital")}
        />
      </div>
      <datalist id="specialization-options">
        {filters.data?.specializations.map((item) => <option key={item} value={item} />)}
      </datalist>
      <datalist id="hospital-options">
        {filters.data?.hospitals.map((item) => <option key={item} value={item} />)}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Phone" type="tel" placeholder="01XXXXXXXXX" error={errors.phone?.message} {...register("phone")} />
        <Input label="Email" type="email" placeholder="doctor@example.com" error={errors.email?.message} {...register("email")} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {doctor ? "Save changes" : "Add doctor"}
        </Button>
      </div>
    </form>
  );
}
