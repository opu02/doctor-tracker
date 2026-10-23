import mongoose, { Types } from "mongoose";
import { Request, Response } from "express";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { AppError } from "../utils/AppError";
import { combine, dateRangeCondition, pageMeta } from "../utils/query";
import { omitInternal, searchCondition } from "../utils/search";
import { idParam } from "../validators/common";
import {
  createDoctorSchema,
  doctorPatientParams,
  listDoctorsQuery,
  updateDoctorSchema,
} from "../validators/doctor";
import { createPatientSchema, listPatientsQuery } from "../validators/patient";
import { listPatients } from "../services/patientService";

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  name_asc: { name: 1, _id: 1 },
  name_desc: { name: -1, _id: -1 },
} as const;

/** patients-per-doctor for one page of doctors: a single grouped query on the doctorId index. */
async function patientCounts(doctorIds: Types.ObjectId[]) {
  const counts = new Map<string, number>();
  if (doctorIds.length === 0) return counts;
  const rows = await Patient.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { doctorId: { $in: doctorIds } } },
    { $group: { _id: "$doctorId", count: { $sum: 1 } } },
  ]);
  rows.forEach((row) => counts.set(String(row._id), row.count));
  return counts;
}

async function requireDoctor(id: string) {
  const exists = await Doctor.exists({ _id: id });
  if (!exists) throw new AppError(404, "Doctor not found");
}

export async function listDoctors(req: Request, res: Response) {
  const query = listDoctorsQuery.parse(req.query);

  const filter = combine([
    searchCondition(query.search),
    query.specialization ? { specialization: query.specialization } : undefined,
    query.hospital ? { hospital: query.hospital } : undefined,
    dateRangeCondition("createdAt", query.from, query.to),
  ]);

  const [items, total] = await Promise.all([
    Doctor.find(filter)
      .sort(SORTS[query.sort])
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Doctor.countDocuments(filter),
  ]);

  const counts = await patientCounts(items.map((doctor) => doctor._id));
  res.json({
    data: items.map((doctor) => ({ ...doctor, patientCount: counts.get(String(doctor._id)) ?? 0 })),
    meta: pageMeta(total, query.page, query.limit),
  });
}

/** Values for the filter dropdowns. */
export async function getDoctorFilters(_req: Request, res: Response) {
  const [specializations, hospitals] = await Promise.all([
    Doctor.distinct("specialization"),
    Doctor.distinct("hospital"),
  ]);
  res.json({ data: { specializations: specializations.sort(), hospitals: hospitals.sort() } });
}

export async function createDoctor(req: Request, res: Response) {
  const input = createDoctorSchema.parse(req.body);
  const doctor = await Doctor.create(input);
  res.status(201).json({ data: omitInternal(doctor.toObject()) });
}

export async function getDoctor(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const [doctor, patientCount] = await Promise.all([
    Doctor.findById(id).lean(),
    Patient.countDocuments({ doctorId: id }),
  ]);
  if (!doctor) throw new AppError(404, "Doctor not found");
  res.json({ data: { ...doctor, patientCount } });
}

export async function updateDoctor(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const input = updateDoctorSchema.parse(req.body);

  const doctor = await Doctor.findById(id);
  if (!doctor) throw new AppError(404, "Doctor not found");

  doctor.set(input);
  await doctor.save(); // save() (not findOneAndUpdate) keeps searchTokens in sync
  res.json({ data: omitInternal(doctor.toObject()) });
}

/** Deleting a doctor also deletes their patients, atomically. */
export async function deleteDoctor(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);

  let found = false;
  let deletedPatients = 0;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      found = false;
      deletedPatients = 0;
      const doctor = await Doctor.findByIdAndDelete(id, { session });
      if (!doctor) return;
      found = true;
      const result = await Patient.deleteMany({ doctorId: id }, { session });
      deletedPatients = result.deletedCount;
    });
  } finally {
    await session.endSession();
  }

  if (!found) throw new AppError(404, "Doctor not found");
  res.json({ data: { message: "Doctor deleted", deletedPatients } });
}

export async function listDoctorPatients(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  await requireDoctor(id);
  const query = listPatientsQuery.parse({ ...req.query, doctorId: id });
  res.json(await listPatients(query));
}

export async function createDoctorPatient(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  await requireDoctor(id);
  const input = createPatientSchema.parse(req.body);
  const patient = await Patient.create({ ...input, doctorId: id });
  res.status(201).json({ data: omitInternal(patient.toObject()) });
}

export async function deleteDoctorPatient(req: Request, res: Response) {
  const { id, patientId } = doctorPatientParams.parse(req.params);
  const patient = await Patient.findOneAndDelete({ _id: patientId, doctorId: id });
  if (!patient) throw new AppError(404, "Patient not found for this doctor");
  res.json({ data: { message: "Patient removed" } });
}
