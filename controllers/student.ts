import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { QuizInvitation, QuizQns } from "../models/quiz";

export const getStudentQuiz: RequestHandler = async (req, res, next) => {
	try {
		const quiz = await QuizInvitation.aggregate([
			{
				$match: {
					invitedTo: new ObjectId(req.user),
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
	} catch (err) {
		next(err);
	}
};

export const getStudentQnsFromQuiz: RequestHandler = async (req, res, next) => {
	const { quizId } = req.params;
	try {
		const quizQns = await QuizQns.find({ quiz: new ObjectId(quizId) }).populate(
			"qns",
			"title description durationOfQns options points"
		);
		return res.status(200).json({
			quizQns: quizQns,
			status: true,
		});
	} catch (err) {
		next(err);
	}
};
