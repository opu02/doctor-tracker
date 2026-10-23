import { Request, Response } from "express";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { AppError } from "../utils/AppError";
import { omitInternal } from "../utils/search";
import { idParam } from "../validators/common";
import { listPatientsQuery, updatePatientSchema } from "../validators/patient";
import { listPatients } from "../services/patientService";

export async function listAllPatients(req: Request, res: Response) {
  const query = listPatientsQuery.parse(req.query);
  res.json(await listPatients(query));
}

/** Values for the condition filter dropdown. */
export async function getPatientFilters(_req: Request, res: Response) {
  const conditions = await Patient.distinct("condition");
  res.json({ data: { conditions: conditions.sort() } });
}

export async function getPatient(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const patient = await Patient.findById(id)
    .populate({ path: "doctorId", select: "name specialization hospital" })
    .lean();
  if (!patient) throw new AppError(404, "Patient not found");
  res.json({ data: patient });
}

export async function updatePatient(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const input = updatePatientSchema.parse(req.body);

  const patient = await Patient.findById(id);
  if (!patient) throw new AppError(404, "Patient not found");

  if (input.doctorId && String(patient.doctorId) !== input.doctorId) {
    const doctorExists = await Doctor.exists({ _id: input.doctorId });
    if (!doctorExists) throw new AppError(404, "Doctor not found");
  }

  patient.set(input);
  await patient.save();
  res.json({ data: omitInternal(patient.toObject()) });
}

export async function deletePatient(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const patient = await Patient.findByIdAndDelete(id);
  if (!patient) throw new AppError(404, "Patient not found");
  res.json({ data: { message: "Patient deleted" } });
}
