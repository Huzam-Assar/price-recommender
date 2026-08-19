import { Router } from "express";
import { recommendTuitionPrice } from "../controllers/tuitionController.js";

const router = Router();

router.post("/ai-recommend", recommendTuitionPrice);

export default router;
