import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth";
import { asyncHandler as h } from "../utils/asyncHandler";
import { getDashboardSummary } from "../controllers/dashboardController";

const router = Router();

router.use(protect, restrictTo("admin"));
router.get("/summary", h(getDashboardSummary));

export default router;
