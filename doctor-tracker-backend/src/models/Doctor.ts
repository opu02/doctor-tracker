import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

const doctorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    // Lower-cased copy of `name` so prefix search can use an index (see indexes below)
    nameLower: { type: String, select: false },
    specialization: { type: String, required: true, trim: true, maxlength: 80 },
    hospital: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

// Keeps nameLower in sync on create/save. For findOneAndUpdate, set nameLower explicitly.
doctorSchema.pre("validate", function () {
  if (this.name) this.nameLower = this.name.trim().toLowerCase();
});

// Prefix search on name (anchored regex ^term uses this index)
doctorSchema.index({ nameLower: 1 });
// Filter by specialization / hospital, newest first (equality + sort in one index)
doctorSchema.index({ specialization: 1, createdAt: -1 });
doctorSchema.index({ hospital: 1, createdAt: -1 });
// Default list ordering and date-range filter
doctorSchema.index({ createdAt: -1 });

export type IDoctor = InferSchemaType<typeof doctorSchema>;
export type DoctorDoc = HydratedDocument<IDoctor>;
export const Doctor = model("Doctor", doctorSchema);
