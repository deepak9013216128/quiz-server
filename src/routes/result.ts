import { Router, Response, Request } from "express";
import {
	getUserQuizResult,
	getQuizResults,
	getUsersResults,
	getUserResults,
} from "../controllers/result";

import { admin, protect } from "../middleware/auth";

const router = Router();

router.route("/").get(protect, getUsersResults);
router.route("/quiz/:quizId").get(protect, getQuizResults);
router.route("/user/:userId").get(protect, getUserResults);
router.route("/:quizId/:userId").get(protect, getUserQuizResult);

export default router;
