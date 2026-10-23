import { z } from "zod";
import {
  emptyToUndefined,
  objectId,
  optionalDate,
  optionalString,
  paginationFields,
  phoneField,
} from "./common";

export const createDoctorSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  specialization: z.string().trim().min(2, "Specialization is required").max(80),
  hospital: z.string().trim().min(2, "Hospital is required").max(120),
  phone: phoneField,
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const updateDoctorSchema = createDoctorSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");

export const listDoctorsQuery = z.object({
  ...paginationFields,
  search: optionalString,
  specialization: optionalString,
  hospital: optionalString,
  from: optionalDate,
  to: optionalDate,
  sort: z.preprocess(
    emptyToUndefined,
    z.enum(["newest", "oldest", "name_asc", "name_desc"]).default("newest")
  ),
});

export const doctorPatientParams = z.object({ id: objectId, patientId: objectId });

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type ListDoctorsQuery = z.infer<typeof listDoctorsQuery>;
