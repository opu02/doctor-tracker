import { z } from "zod";
import {
  emptyToUndefined,
  objectId,
  optionalDate,
  optionalObjectId,
  optionalString,
  paginationFields,
  phoneField,
} from "./common";
import { GENDERS } from "../models/Patient";

export const createPatientSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  age: z.coerce.number().int("Age must be a whole number").min(0).max(130),
  gender: z.enum(GENDERS),
  phone: phoneField,
  condition: z.string().trim().min(2, "Condition is required").max(120),
  admittedDate: z.coerce.date().optional(),
});

export const updatePatientSchema = createPatientSchema
  .partial()
  .extend({ doctorId: objectId.optional() })
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");

export const listPatientsQuery = z.object({
  ...paginationFields,
  search: optionalString,
  condition: optionalString,
  gender: z.preprocess(emptyToUndefined, z.enum(GENDERS).optional()),
  doctorId: optionalObjectId,
  from: optionalDate,
  to: optionalDate,
  sort: z.preprocess(
    emptyToUndefined,
    z.enum(["newest", "oldest", "name_asc", "name_desc"]).default("newest")
  ),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type ListPatientsQuery = z.infer<typeof listPatientsQuery>;
