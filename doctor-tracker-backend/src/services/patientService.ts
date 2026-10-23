import { Types } from "mongoose";
import { Patient } from "../models/Patient";
import { ListPatientsQuery } from "../validators/patient";
import { searchCondition } from "../utils/search";
import { combine, dateRangeCondition, pageMeta } from "../utils/query";

const SORTS = {
  newest: { admittedDate: -1, _id: -1 },
  oldest: { admittedDate: 1, _id: 1 },
  name_asc: { name: 1, _id: 1 },
  name_desc: { name: -1, _id: -1 },
} as const;

type PopulatedDoctor = { _id: Types.ObjectId; name: string; specialization: string; hospital: string };

/** Shared by GET /patients and GET /doctors/:id/patients. */
export async function listPatients(query: ListPatientsQuery) {
  const filter = combine([
    searchCondition(query.search),
    query.condition ? { condition: query.condition } : undefined,
    query.gender ? { gender: query.gender } : undefined,
    query.doctorId ? { doctorId: new Types.ObjectId(query.doctorId) } : undefined,
    dateRangeCondition("admittedDate", query.from, query.to),
  ]);

  const [items, total] = await Promise.all([
    Patient.find(filter)
      .sort(SORTS[query.sort])
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate({ path: "doctorId", select: "name specialization hospital" })
      .lean(),
    Patient.countDocuments(filter),
  ]);

  const data = items.map((patient) => {
    const doctor = patient.doctorId as unknown as PopulatedDoctor | null;
    return { ...patient, doctorId: doctor?._id ?? null, doctor };
  });

  return { data, meta: pageMeta(total, query.page, query.limit) };
}
