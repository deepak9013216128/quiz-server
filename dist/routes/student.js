"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_1 = require("../controllers/student");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.route("/quiz").get(auth_1.protect, student_1.getStudentQuiz);
router
    .route("/quiz/:quizId")
    .get(auth_1.protect, student_1.getStudentQuiz)
    .post(auth_1.protect, student_1.submitQuiz);
router.route("/results").get(auth_1.protect, student_1.getQuizResults);
router.route("/results/:quizId").get(auth_1.protect, student_1.getQuizResult);
exports.default = router;
