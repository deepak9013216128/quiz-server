"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRes = exports.QuizInvitation = exports.QuizQns = exports.Quiz = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = require("mongoose");
const quizScehma = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    user: {
        type: mongodb_1.ObjectId,
        ref: "User",
        required: true,
    },
});
quizScehma.post("save", function (error, doc, next) {
    if (error.name === "MongoServerError" && error.code === 11000) {
        next(new Error("Quiz already exit, please create new one."));
    }
    else {
        next();
    }
});
const quizQnsSchema = new mongoose_1.Schema({
    quiz: {
        type: mongodb_1.ObjectId,
        ref: "Quiz",
        required: true,
    },
    qns: {
        type: mongodb_1.ObjectId,
        ref: "Qns",
        required: true,
    },
});
const quizInvitationSchema = new mongoose_1.Schema({
    quiz: {
        type: mongodb_1.ObjectId,
        ref: "Quiz",
        required: true,
    },
    invitedTo: {
        type: mongodb_1.ObjectId,
        ref: "User",
        required: true,
    },
    invitedBy: {
        type: mongodb_1.ObjectId,
        ref: "User",
        required: true,
    },
    isAttempted: {
        type: Boolean,
        default: false,
    },
});
const userResponseSchema = new mongoose_1.Schema({
    quiz: {
        type: mongodb_1.ObjectId,
        ref: "Quiz",
        required: true,
    },
    user: {
        type: mongodb_1.ObjectId,
        ref: "User",
        required: true,
    },
    qns: {
        type: mongodb_1.ObjectId,
        ref: "Qns",
        required: true,
    },
    ans: {
        type: Number,
        required: true,
    },
    points: {
        type: Number,
        required: true,
        enum: [0, 1, 2, 3, 4, 5],
    },
    timeTaken: {
        type: Number,
    },
});
exports.Quiz = (0, mongoose_1.model)("Quiz", quizScehma);
exports.QuizQns = (0, mongoose_1.model)("QuizQns", quizQnsSchema);
exports.QuizInvitation = (0, mongoose_1.model)("QuizInvitation", quizInvitationSchema);
exports.UserRes = (0, mongoose_1.model)("UserRes", userResponseSchema);
