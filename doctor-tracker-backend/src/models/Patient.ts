import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";
import { buildSearchTokens } from "../utils/search";

export const GENDERS = ["male", "female", "other"] as const;

const patientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: GENDERS, required: true },
    phone: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true, maxlength: 120 },
    admittedDate: { type: Date, required: true, default: Date.now },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    searchTokens: { type: [String], select: false },
  },
  { timestamps: true }
);

patientSchema.pre("validate", function () {
  this.set("searchTokens", buildSearchTokens([this.name], [this.phone]));
});

// A doctor's patients, newest admission first (doctor detail page + patients-per-doctor counts)
patientSchema.index({ doctorId: 1, admittedDate: -1 });
// Condition filter, newest admission first
patientSchema.index({ condition: 1, admittedDate: -1 });
// Search by name word / phone prefix
patientSchema.index({ searchTokens: 1 });
// Date-range filter, default ordering and date-based dashboard statistics
patientSchema.index({ admittedDate: -1 });
patientSchema.index({ name: 1 });

export type IPatient = InferSchemaType<typeof patientSchema>;
export type PatientDoc = HydratedDocument<IPatient>;
export const Patient = model("Patient", patientSchema);
