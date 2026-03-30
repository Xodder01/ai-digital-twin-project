import express from "express";
import { addData, getData, getDashboardAnalytics } from "../controllers/dataController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardAnalytics);
router.post("/", protect, addData);
router.get("/", protect, getData);

export default router;