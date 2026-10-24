import { z } from "zod";
import { emptyToUndefined } from "./common";

export const dashboardQuery = z.object({
  days: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .refine((value) => [7, 30, 90].includes(value), "days must be 7, 30 or 90")
      .default(30)
  ),
});
