import { Router } from "express";
import authRoutes from "./auth";
import doctorRoutes from "./doctors";
import patientRoutes from "./patients";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);

// Step 4: dashboard routes will be mounted here

export default router;
