import { Router } from "express";
import authRoutes from "./auth";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);

// Step 3+: doctors, patients, dashboard routes (all behind `protect`) will be mounted here

export default router;
