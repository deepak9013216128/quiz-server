"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuiz = exports.getStudentQnsFromQuiz = exports.getStudentQuiz = void 0;
const mongodb_1 = require("mongodb");
const quiz_1 = require("../models/quiz");
const getStudentQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quiz = yield quiz_1.QuizInvitation.aggregate([
            {
                $match: {
                    invitedTo: new mongodb_1.ObjectId(req.user),
                },
            },
            {
                $lookup: {
                    from: "quizqns",
                    localField: "quiz",
                    foreignField: "quiz",
                    as: "qns",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "invitedBy",
                    foreignField: "_id",
                    as: "invitedBy",
                },
            },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "quiz",
                    foreignField: "_id",
                    as: "quiz",
                },
            },
            { $unwind: "$invitedBy" },
            { $unwind: "$quiz" },
            {
                $project: {
                    isAttempted: 1,
                    noOfQns: { $size: "$qns" },
                    invitedBy: {
                        name: 1,
                    },
                    quiz: {
                        title: 1,
                        description: 1,
                    },
                },
            },
        ]);
        return res.status(200).json({
            quiz: quiz,
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getStudentQuiz = getStudentQuiz;
const getStudentQnsFromQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { quizId } = req.params;
    try {
        const quizQns = yield quiz_1.QuizQns.find({ quiz: new mongodb_1.ObjectId(quizId) }).populate("qns", "title description durationOfQns options points");
        return res.status(200).json({
            quizQns: quizQns,
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getStudentQnsFromQuiz = getStudentQnsFromQuiz;
const submitQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { quizId } = req.params;
    try {
        yield quiz_1.QuizInvitation.findOneAndUpdate({
            quiz: new mongodb_1.ObjectId(quizId),
            invitedTo: new mongodb_1.ObjectId(req.user),
        });
        return res.status(200).json({
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.submitQuiz = submitQuiz;
