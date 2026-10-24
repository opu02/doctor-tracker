export type User = { id: string; name: string; email: string; role: "admin" };

export type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  patientCount?: number;
};

export type Gender = "male" | "female" | "other";

export type PatientDoctor = { _id: string; name: string; specialization: string; hospital: string };

export type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  condition: string;
  admittedDate: string;
  doctorId: string | null;
  doctor?: PatientDoctor | null;
  createdAt: string;
  updatedAt: string;
};

export type PageMeta = { page: number; limit: number; total: number; totalPages: number };
export type Paginated<T> = { data: T[]; meta: PageMeta };

export type NameCount = { name: string; count: number };

export type DashboardSummary = {
  range: { days: number; from: string; to: string };
  totals: {
    doctors: number;
    patients: number;
    patientsInRange: number;
    patientsPreviousRange: number;
    changePercent: number | null;
    averagePatientsPerDoctor: number;
  };
  patientsOverTime: Array<{ date: string; count: number }>;
  patientsPerDoctor: Array<{ doctorId: string; name: string; specialization: string; patients: number }>;
  conditions: NameCount[];
  specializations: NameCount[];
  gender: NameCount[];
  recentPatients: Patient[];
};
