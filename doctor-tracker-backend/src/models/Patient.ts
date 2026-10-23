import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

export const GENDERS = ["male", "female", "other"] as const;

const patientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    nameLower: { type: String, select: false },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: GENDERS, required: true },
    phone: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true, maxlength: 120 },
    admittedDate: { type: Date, required: true, default: Date.now },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  },
  { timestamps: true }
);

patientSchema.pre("validate", function () {
  if (this.name) this.nameLower = this.name.trim().toLowerCase();
});

// A doctor's patients, newest first (doctor detail page + patients-per-doctor aggregation)
patientSchema.index({ doctorId: 1, createdAt: -1 });
// Condition filter, newest first
patientSchema.index({ condition: 1, createdAt: -1 });
// Prefix search on patient name
patientSchema.index({ nameLower: 1 });
// Date-range filter and date-based dashboard statistics
patientSchema.index({ admittedDate: -1 });
patientSchema.index({ createdAt: -1 });

export type IPatient = InferSchemaType<typeof patientSchema>;
export type PatientDoc = HydratedDocument<IPatient>;
export const Patient = model("Patient", patientSchema);
