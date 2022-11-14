import { Router, Response, Request } from "express";
import { getUserQuizResult } from "../controllers/result";

import { admin, protect } from "../middleware/auth";

const router = Router();

router.route("/:quizId/:userId").get(protect, getUserQuizResult);

export default router;
