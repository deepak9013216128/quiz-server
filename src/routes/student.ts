import { Router, Response, Request } from "express";

import {
	getQuizResult,
	getQuizResults,
	getStudentQuiz,
	submitQuiz,
} from "../controllers/student";

import { admin, protect } from "../middleware/auth";

const router = Router();

router.route("/quiz").get(protect, getStudentQuiz);
router
	.route("/quiz/:quizId")
	.get(protect, getStudentQuiz)
	.post(protect, submitQuiz);

router.route("/results").get(protect, getQuizResults);
router.route("/results/:quizId").get(protect, getQuizResult);

export default router;
