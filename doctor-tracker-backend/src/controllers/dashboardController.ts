import { Request, Response } from "express";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { dashboardQuery } from "../validators/dashboard";
import { DAY, DHAKA_TZ, fillDailySeries, startOfDhakaDay } from "../utils/dhakaTime";
import { listPatients } from "../services/patientService";

type NameCount = { name: string; count: number };

const nameCount = (rows: Array<{ _id: string; count: number }>): NameCount[] =>
  rows.map((row) => ({ name: row._id, count: row.count }));

/**
 * GET /dashboard/summary?days=7|30|90
 * Every number comes from MongoDB aggregation, so the browser receives small, chart-ready arrays
 * instead of raw documents. The queries are independent, so they run in parallel.
 */
export async function getDashboardSummary(req: Request, res: Response) {
  const { days } = dashboardQuery.parse(req.query);

  const now = new Date();
  const start = startOfDhakaDay(now, days - 1); // first day of the selected range
  const previousStart = new Date(start.getTime() - days * DAY);

  const [
    totalDoctors,
    totalPatients,
    patientsInRange,
    patientsPreviousRange,
    dailyRows,
    perDoctorRows,
    conditionRows,
    specializationRows,
    genderRows,
    recent,
  ] = await Promise.all([
    Doctor.estimatedDocumentCount(),
    Patient.estimatedDocumentCount(),
    Patient.countDocuments({ admittedDate: { $gte: start } }),
    Patient.countDocuments({ admittedDate: { $gte: previousStart, $lt: start } }),

    // Patients admitted per day (grouped in Dhaka time)
    Patient.aggregate<{ _id: string; count: number }>([
      { $match: { admittedDate: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$admittedDate", timezone: DHAKA_TZ } },
          count: { $sum: 1 },
        },
      },
    ]),

    // Top 10 doctors by patient count; $lookup runs only on the 10 survivors
    Patient.aggregate([
      { $group: { _id: "$doctorId", patients: { $sum: 1 } } },
      { $sort: { patients: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: Doctor.collection.name,
          localField: "_id",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1, specialization: 1 } }],
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          _id: 0,
          doctorId: "$_id",
          name: "$doctor.name",
          specialization: "$doctor.specialization",
          patients: 1,
        },
      },
    ]),

    Patient.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$condition", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 7 },
    ]),

    Doctor.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$specialization", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),

    Patient.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$gender", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    listPatients({ page: 1, limit: 5, sort: "newest" }),
  ]);

  // Top 7 conditions + an "Other" slice, so the donut always adds up to the total patients
  const conditions = nameCount(conditionRows);
  const otherPatients = totalPatients - conditions.reduce((sum, item) => sum + item.count, 0);
  if (otherPatients > 0) conditions.push({ name: "Other", count: otherPatients });

  const dailyCounts = new Map(dailyRows.map((row) => [row._id, row.count]));
  const changePercent =
    patientsPreviousRange === 0
      ? null
      : Math.round(((patientsInRange - patientsPreviousRange) / patientsPreviousRange) * 1000) / 10;

  res.json({
    data: {
      range: { days, from: start.toISOString(), to: now.toISOString() },
      totals: {
        doctors: totalDoctors,
        patients: totalPatients,
        patientsInRange,
        patientsPreviousRange,
        changePercent,
        averagePatientsPerDoctor: totalDoctors ? Math.round((totalPatients / totalDoctors) * 10) / 10 : 0,
      },
      patientsOverTime: fillDailySeries(start, days, dailyCounts),
      patientsPerDoctor: perDoctorRows,
      conditions,
      specializations: nameCount(specializationRows),
      gender: nameCount(genderRows),
      recentPatients: recent.data,
    },
  });
}
