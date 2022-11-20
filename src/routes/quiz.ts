import { Router, Response, Request } from "express";
import {
	addQnsInQuiz,
	createQnsResponse,
	createQuiz,
	getQnsFromQuiz,
	getQuiz,
	getQuizInvitation,
	sendQuizInvitation,
} from "../controllers/quiz";

import { admin, protect } from "../middleware/auth";

const router = Router();

router.route("/").get(protect, getQuiz).post(protect, createQuiz);

router
	.route("/invitation")
	.get(protect, getQuizInvitation)
	.post(protect, sendQuizInvitation);
// .put(protect,)

router
	.route("/:quizId")
	.get(protect, getQnsFromQuiz)
	.post(protect, addQnsInQuiz);

router.route("/:quizId/:qnsId").post(protect, createQnsResponse);
export default router;
