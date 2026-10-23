import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Step 2+: auth, doctors, patients, dashboard routes will be mounted here

export default router;
