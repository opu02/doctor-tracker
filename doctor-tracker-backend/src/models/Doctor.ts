import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";
import { buildSearchTokens } from "../utils/search";

const doctorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    specialization: { type: String, required: true, trim: true, maxlength: 80 },
    hospital: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Lower-case words/prefix-search keys derived from the fields above (never sent to the client)
    searchTokens: { type: [String], select: false },
  },
  { timestamps: true }
);

// Recomputed on every create/save. For findOneAndUpdate you must use doc.save() instead.
doctorSchema.pre("validate", function () {
  this.set(
    "searchTokens",
    buildSearchTokens([this.name, this.specialization, this.hospital], [this.email, this.phone])
  );
});

// Search box: anchored prefix regex on a multikey index
doctorSchema.index({ searchTokens: 1 });
// Filters (equality) + newest-first sort served by one index each
doctorSchema.index({ specialization: 1, createdAt: -1 });
doctorSchema.index({ hospital: 1, createdAt: -1 });
// Default ordering, date-range filter, sort by name
doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ name: 1 });

export type IDoctor = InferSchemaType<typeof doctorSchema>;
export type DoctorDoc = HydratedDocument<IDoctor>;
export const Doctor = model("Doctor", doctorSchema);
