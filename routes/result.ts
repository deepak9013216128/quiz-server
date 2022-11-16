import { Router, Response, Request } from "express";
import { getUserQuizResult, getQuizResults } from "../controllers/result";

import { admin, protect } from "../middleware/auth";

const router = Router();

router.route("/:quizId").get(protect, getQuizResults);
router.route("/:quizId/:userId").get(protect, getUserQuizResult);

export default router;
