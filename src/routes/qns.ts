import { Router, Response, Request } from "express";
import {
	createQns,
	createSubTopic,
	createTopic,
	getQns,
	getSubTopics,
	getTopics,
} from "../controllers/qns";

import { admin, protect } from "../middleware/auth";

const router = Router();

router.route("/").get(protect, getQns).post(protect, createQns);

router.route("/topics").get(protect, getTopics).post(protect, createTopic);
router
	.route("/topics/:topicId")
	.get(protect, getSubTopics)
	.post(protect, createSubTopic);

export default router;
