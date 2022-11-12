import { Router, Response, Request } from "express";

import { getStudentQuiz, submitQuiz } from "../controllers/student";

import { admin, protect } from "../middleware/auth";

const router = Router();

router.route("/quiz").get(protect, getStudentQuiz);
router
	.route("/quiz/:quizId")
	.get(protect, getStudentQuiz)
	.post(protect, submitQuiz);

export default router;
