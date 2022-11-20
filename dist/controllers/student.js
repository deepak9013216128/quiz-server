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
exports.getQuizResult = exports.getQuizResults = exports.submitQuiz = exports.getStudentQnsFromQuiz = exports.getStudentQuiz = void 0;
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
        const quizInvitation = yield quiz_1.QuizInvitation.findOneAndUpdate({
            quiz: new mongodb_1.ObjectId(quizId),
            invitedTo: new mongodb_1.ObjectId(req.user),
        }, { isAttempted: true });
        return res.status(200).json({
            status: true,
            quizInvitation,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.submitQuiz = submitQuiz;
const getQuizResults = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield quiz_1.QuizInvitation.aggregate([
            {
                $match: {
                    invitedTo: new mongodb_1.ObjectId(req.user),
                    isAttempted: true,
                },
            },
            {
                $lookup: {
                    from: "userres",
                    localField: "invitedTo",
                    foreignField: "user",
                    let: { invitedTo: "$invitedTo", quiz: "$quiz" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user", "$$invitedTo"] },
                                        { $eq: ["$quiz", "$$quiz"] },
                                    ],
                                },
                            },
                        },
                        { $project: { ans: 0, quiz: 0, user: 0 } },
                    ],
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
                    successfullAttempted: {
                        $size: {
                            $filter: {
                                input: "$qns",
                                as: "qns",
                                cond: { $gt: ["$$qns.points", 0] },
                            },
                        },
                    },
                    qns: 1,
                    quiz: {
                        title: 1,
                        description: 1,
                        _id: 1,
                    },
                },
            },
        ]);
        return res.status(200).json({
            status: true,
            results,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getQuizResults = getQuizResults;
const getQuizResult = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { quizId } = req.params;
    try {
        const result = yield quiz_1.UserRes.find({
            user: new mongodb_1.ObjectId(req.user),
            quiz: new mongodb_1.ObjectId(quizId),
        }).populate("qns", "description options title");
        return res.status(200).json({
            status: true,
            result,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getQuizResult = getQuizResult;
