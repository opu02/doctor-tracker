import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api";

/**
 * Puts API validation errors next to the matching form fields.
 * Returns a general message for anything that does not belong to a field (or null if all were placed).
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: Array<Path<T>>
): string | null {
  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";

  let placed = false;
  for (const issue of error.details ?? []) {
    const name = issue.path as Path<T>;
    if (fields.includes(name)) {
      setError(name, { message: issue.message });
      placed = true;
    }
  }

  // duplicate key, e.g. "email already exists"
  if (error.status === 409) {
    const field = fields.find((f) => error.message.toLowerCase().startsWith(String(f).toLowerCase()));
    if (field) {
      setError(field, { message: `This ${String(field)} is already in use` });
      placed = true;
    }
  }

  return placed ? null : error.message;
}
