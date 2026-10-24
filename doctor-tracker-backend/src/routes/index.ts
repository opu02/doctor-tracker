import { Router } from "express";
import authRoutes from "./auth";
import dashboardRoutes from "./dashboard";
import doctorRoutes from "./doctors";
import patientRoutes from "./patients";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);

export default router;
