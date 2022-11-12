"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_1 = require("../controllers/quiz");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.route("/").get(auth_1.protect, quiz_1.getQuiz).post(auth_1.protect, quiz_1.createQuiz);
router
    .route("/invitation")
    .get(auth_1.protect, quiz_1.getQuizInvitation)
    .post(auth_1.protect, quiz_1.sendQuizInvitation);
// .put(protect,)
router
    .route("/:quizId")
    .get(auth_1.protect, quiz_1.getQnsFromQuiz)
    .post(auth_1.protect, quiz_1.addQnsInQuiz);
router.route("/:quizId/:qnsId").post(auth_1.protect, quiz_1.createQnsResponse);
exports.default = router;
