import { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { ZodType } from "zod";

/** Minimal zod resolver for react-hook-form (keeps the dependency list small). */
export function zodResolver<TValues extends FieldValues>(schema: ZodType): Resolver<TValues> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) return { values: result.data as TValues, errors: {} };

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (key && !errors[key]) errors[key] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: errors as FieldErrors<TValues> };
  };
}
