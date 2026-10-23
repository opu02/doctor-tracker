import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth";
import { asyncHandler as h } from "../utils/asyncHandler";
import {
  deletePatient,
  getPatient,
  getPatientFilters,
  listAllPatients,
  updatePatient,
} from "../controllers/patientController";

const router = Router();

router.use(protect, restrictTo("admin"));

router.get("/filters", h(getPatientFilters)); // must stay above "/:id"
router.get("/", h(listAllPatients));
router.route("/:id").get(h(getPatient)).patch(h(updatePatient)).delete(h(deletePatient));

export default router;
