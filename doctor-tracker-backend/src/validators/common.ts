import { z } from "zod";

export const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
export const idParam = z.object({ id: objectId });

export const optionalString = z.preprocess(emptyToUndefined, z.string().trim().max(100).optional());
export const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());
export const optionalObjectId = z.preprocess(emptyToUndefined, objectId.optional());

export const paginationFields = {
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(100).default(10)),
};

// Bangladesh mobile: 01XXXXXXXXX, optionally prefixed with 88 or +88
export const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;

export const phoneField = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(BD_PHONE, "Enter a valid Bangladesh mobile number"))
  // Always store the local 11-digit form (01XXXXXXXXX) so search and display are consistent
  .transform((value) => value.replace(/^\+?88(?=01)/, ""));
