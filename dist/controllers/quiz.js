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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQnsResponse = exports.getQuizInvitation = exports.sendQuizInvitation = exports.getQnsFromQuiz = exports.addQnsInQuiz = exports.getQuiz = exports.createQuiz = void 0;
const mongodb_1 = require("mongodb");
const qns_1 = __importDefault(require("../models/qns"));
const quiz_1 = require("../models/quiz");
const user_1 = __importDefault(require("../models/user"));
const createQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description } = req.body;
    try {
        if (req.user.role !== "admin" && req.user.role !== "instructor") {
            res.status(403);
            throw new Error("Not authorized to create quiz.");
        }
        const quiz = new quiz_1.Quiz({ title, description, user: req.user });
        yield quiz.save();
        return res.status(201).json({
            message: "Quiz created.",
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createQuiz = createQuiz;
const getQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let quiz;
        if (req.user.role === "student") {
            quiz = yield quiz_1.QuizInvitation.aggregate([
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
                            _id: 1,
                            title: 1,
                            description: 1,
                        },
                    },
                },
            ]);
        }
        else {
            quiz = yield quiz_1.Quiz.aggregate([
                { $match: { user: new mongodb_1.ObjectId(req.user) } },
                {
                    $lookup: {
                        from: "quizqns",
                        localField: "_id",
                        foreignField: "quiz",
                        as: "noOfQns",
                    },
                },
                {
                    $lookup: {
                        from: "quizinvitations",
                        localField: "_id",
                        foreignField: "quiz",
                        as: "invitation",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        noOfQns: { $size: "$noOfQns" },
                        noOfInvitation: { $size: "$invitation" },
                        quizAttempted: {
                            $size: {
                                $filter: {
                                    input: "$invitation",
                                    cond: {
                                        $eq: ["$$i.isAttempted", true],
                                    },
                                    as: "i",
                                },
                            },
                        },
                    },
                },
            ]).exec();
        }
        return res.status(200).json({
            quiz: quiz,
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getQuiz = getQuiz;
const addQnsInQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { qnsId } = req.body;
    const { quizId } = req.params;
    try {
        if (req.user.role !== "admin" && req.user.role !== "instructor") {
            res.status(403);
            throw new Error("Not authorized to add qns in quiz.");
        }
        const doesExit = yield quiz_1.QuizQns.exists({
            quiz: new mongodb_1.ObjectId(quizId),
            qns: new mongodb_1.ObjectId(qnsId),
        });
        if (doesExit) {
            return res.status(422).json({
                message: "Qns already exit in quiz.",
                status: false,
            });
        }
        const qns = yield qns_1.default.findByIdAndUpdate(qnsId, { $inc: { qnsUsed: 1 } });
        const quizQns = new quiz_1.QuizQns({
            quiz: new mongodb_1.ObjectId(quizId),
            qns: new mongodb_1.ObjectId(qnsId),
        });
        yield quizQns.save();
        return res.status(201).json({
            message: "Qns added in quiz.",
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.addQnsInQuiz = addQnsInQuiz;
const getQnsFromQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { quizId } = req.params;
    try {
        let quizQns;
        if (req.user.role === "student") {
            quizQns = yield quiz_1.QuizQns.find({ quiz: new mongodb_1.ObjectId(quizId) }).populate("qns", "title description durationOfQns options points");
        }
        else {
            quizQns = yield quiz_1.QuizQns.find({ quiz: new mongodb_1.ObjectId(quizId) }).populate("qns", {});
        }
        return res.status(200).json({
            quizQns: quizQns,
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getQnsFromQuiz = getQnsFromQuiz;
const sendQuizInvitation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, quizId } = req.body;
    try {
        if (req.user.role !== "admin" && req.user.role !== "instructor") {
            res.status(403);
            throw new Error("Not authorized to send quiz inivition.");
        }
        const invitedTo = yield user_1.default.findOne({ email }).select("_id role");
        if (!invitedTo) {
            res.status(422);
            throw new Error(`User of ${email} not Found, please send invitation to ${email}`);
        }
        if (invitedTo.role !== "student") {
            res.status(422);
            throw new Error(`You don't have permission to send inviation to ${email}`);
        }
        const doesExit = yield quiz_1.QuizInvitation.exists({
            quiz: new mongodb_1.ObjectId(quizId),
            invitedTo: new mongodb_1.ObjectId(invitedTo._id),
        });
        if (doesExit) {
            return res.status(422).json({
                message: "Quiz invitation already sent.",
                status: false,
            });
        }
        const quizInvitation = new quiz_1.QuizInvitation({
            quiz: new mongodb_1.ObjectId(quizId),
            invitedTo: new mongodb_1.ObjectId(invitedTo._id),
            invitedBy: new mongodb_1.ObjectId(req.user),
        });
        yield quizInvitation.save();
        return res.status(201).json({
            message: "Quiz invitation sent.",
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.sendQuizInvitation = sendQuizInvitation;
const getQuizInvitation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.role !== "admin" && req.user.role !== "instructor") {
            res.status(403);
            throw new Error("Not authorized to fetch quiz inivition.");
        }
        const quizInvitation = yield quiz_1.QuizInvitation.find({
            invitedBy: new mongodb_1.ObjectId(req.user),
        }).populate("invitedTo", "name email");
        return res.status(200).json({
            quizInvitation: quizInvitation,
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getQuizInvitation = getQuizInvitation;
const createQnsResponse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { qnsId, quizId } = req.params;
    const { ans, timeTaken } = req.body;
    try {
        if (req.user.role === "admin" || req.user.role === "instructor") {
            res.status(403);
            throw new Error("Not authorized.");
        }
        const qns = yield qns_1.default.findById(qnsId);
        let userRes = yield quiz_1.UserRes.findOne({
            user: new mongodb_1.ObjectId(req.user),
            qns: new Object(qnsId),
            quiz: new Object(quizId),
        });
        if (!userRes) {
            userRes = new quiz_1.UserRes({
                user: new mongodb_1.ObjectId(req.user),
                qns: new Object(qnsId),
                quiz: new Object(quizId),
                ans: ans,
                points: ans === -1 ? 0 : ans === (qns === null || qns === void 0 ? void 0 : qns.correctChoice) ? qns === null || qns === void 0 ? void 0 : qns.points : 0,
                timeTaken,
            });
        }
        else {
            userRes.ans = ans;
            userRes.timeTaken = timeTaken;
            userRes.points =
                ans === -1
                    ? 0
                    : ans === (qns === null || qns === void 0 ? void 0 : qns.correctChoice)
                        ? qns === null || qns === void 0 ? void 0 : qns.points
                        : 0;
        }
        console.log(qns, ans);
        yield userRes.save();
        return res.status(200).json({
            message: "Qns response created.",
            data: userRes,
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createQnsResponse = createQnsResponse;
