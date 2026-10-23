import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth";
import { asyncHandler as h } from "../utils/asyncHandler";
import {
  createDoctor,
  createDoctorPatient,
  deleteDoctor,
  deleteDoctorPatient,
  getDoctor,
  getDoctorFilters,
  listDoctorPatients,
  listDoctors,
  updateDoctor,
} from "../controllers/doctorController";

const router = Router();

router.use(protect, restrictTo("admin"));

router.get("/filters", h(getDoctorFilters)); // must stay above "/:id"
router.route("/").get(h(listDoctors)).post(h(createDoctor));
router.route("/:id").get(h(getDoctor)).patch(h(updateDoctor)).delete(h(deleteDoctor));
router.route("/:id/patients").get(h(listDoctorPatients)).post(h(createDoctorPatient));
router.delete("/:id/patients/:patientId", h(deleteDoctorPatient));

export default router;
