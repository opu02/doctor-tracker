/**
 * Seed script
 *   npm run seed            -> upserts the admin user; adds sample doctors/patients only if none exist
 *   npm run seed -- --fresh -> wipes doctors + patients and generates the sample data again
 *
 * Uses a seeded random generator, so the data is the same on every run.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { env } from "../config/env";
import { User } from "../models/User";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";

const DOCTOR_COUNT = 30;
const PATIENT_COUNT = 320;

// ---------- deterministic random helpers ----------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261023);
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(int(8, 20), int(0, 59), 0, 0);
  return d;
}
function phone() {
  let digits = "";
  for (let i = 0; i < 8; i++) digits += int(0, 9);
  return `01${pick(["3", "4", "5", "6", "7", "8", "9"])}${digits}`;
}

// ---------- sample data ----------
const MALE_FIRST = ["Abdur", "Rahim", "Karim", "Imran", "Tanvir", "Fahim", "Nasir", "Sabbir", "Mehedi", "Rafiq", "Shakib", "Arif", "Jahid", "Hasan", "Mizanur"];
const FEMALE_FIRST = ["Nusrat", "Farhana", "Shirin", "Sadia", "Tasnim", "Mim", "Rumana", "Jannat", "Sumaiya", "Afsana", "Lamia", "Nabila", "Tahmina", "Sharmin", "Ritu"];
const LAST = ["Rahman", "Hossain", "Ahmed", "Islam", "Chowdhury", "Khan", "Uddin", "Akter", "Sarker", "Mia", "Talukder", "Siddique", "Bhuiyan", "Mondal", "Haque"];

const HOSPITALS = [
  "Square Hospital, Dhaka",
  "United Hospital, Dhaka",
  "Evercare Hospital, Dhaka",
  "Labaid Specialized Hospital, Dhaka",
  "Popular Medical College Hospital, Dhaka",
  "Ibn Sina Hospital, Dhaka",
  "Dhaka Medical College Hospital",
  "Apollo Hospital, Dhaka",
];

const CONDITIONS_BY_SPECIALIZATION: Record<string, string[]> = {
  Cardiology: ["Hypertension", "Heart Disease", "Arrhythmia"],
  Neurology: ["Migraine", "Epilepsy", "Stroke Recovery"],
  Orthopedics: ["Fracture", "Arthritis", "Back Pain"],
  Pediatrics: ["Fever", "Asthma", "Pneumonia"],
  Dermatology: ["Skin Allergy", "Eczema", "Acne"],
  Gastroenterology: ["Gastritis", "Ulcer", "Liver Disease"],
  Pulmonology: ["Asthma", "Pneumonia", "COPD"],
  "General Medicine": ["Diabetes", "Hypertension", "Fever"],
  ENT: ["Sinusitis", "Ear Infection", "Tonsillitis"],
  Ophthalmology: ["Cataract", "Glaucoma", "Conjunctivitis"],
};
const SPECIALIZATIONS = Object.keys(CONDITIONS_BY_SPECIALIZATION);

function buildName(gender: "male" | "female") {
  return `${pick(gender === "male" ? MALE_FIRST : FEMALE_FIRST)} ${pick(LAST)}`;
}

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    { $set: { name: "Admin", passwordHash, role: "admin" } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin ready: ${env.ADMIN_EMAIL.toLowerCase()}`);
}

async function seedSampleData(fresh: boolean) {
  const existing = await Doctor.estimatedDocumentCount();
  if (existing > 0 && !fresh) {
    console.log(`Found ${existing} doctors, skipping sample data (run "npm run seed -- --fresh" to reset).`);
    return;
  }
  if (fresh) {
    await Promise.all([Doctor.deleteMany({}), Patient.deleteMany({})]);
    console.log("Cleared doctors and patients.");
  }

  // Doctors: created 91-150 days ago so every patient is registered after the doctor
  const doctorDocs = Array.from({ length: DOCTOR_COUNT }, (_, i) => {
    const gender = rand() < 0.65 ? "male" : "female";
    const name = buildName(gender);
    const createdAt = daysAgo(int(91, 150));
    return {
      name,
      specialization: SPECIALIZATIONS[i % SPECIALIZATIONS.length],
      hospital: pick(HOSPITALS),
      phone: phone(),
      email: `${name.toLowerCase().replace(/\s+/g, ".")}.${i + 1}@example.com`,
      createdAt,
      updatedAt: createdAt,
    };
  });
  const doctors = await Doctor.insertMany(doctorDocs);
  console.log(`Inserted ${doctors.length} doctors.`);

  // Uneven weights so the "patients per doctor" chart is interesting
  const weights = doctors.map(() => int(1, 9));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const pickDoctorIndex = () => {
    let r = rand() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return weights.length - 1;
  };

  const patientDocs = Array.from({ length: PATIENT_COUNT }, () => {
    const doctorIndex = pickDoctorIndex();
    const doctor = doctors[doctorIndex];
    const gender = rand() < 0.5 ? "male" : "female";
    const admittedDate = daysAgo(int(0, 90));
    return {
      name: buildName(gender),
      age: doctor.specialization === "Pediatrics" ? int(1, 14) : int(15, 88),
      gender,
      phone: phone(),
      condition: pick(CONDITIONS_BY_SPECIALIZATION[doctor.specialization]),
      admittedDate,
      doctorId: doctor._id,
      createdAt: admittedDate,
      updatedAt: admittedDate,
    };
  });
  const patients = await Patient.insertMany(patientDocs);
  console.log(`Inserted ${patients.length} patients.`);
}

async function main() {
  const fresh = process.argv.includes("--fresh");
  await connectDB();
  // Make sure indexes exist before inserting data
  await Promise.all([User.init(), Doctor.init(), Patient.init()]);
  await seedAdmin();
  await seedSampleData(fresh);
  await mongoose.disconnect();
  console.log("Seeding finished.");
}

main().catch(async (err) => {
  console.error("Seeding failed:", err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
