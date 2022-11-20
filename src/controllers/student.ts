import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { QuizInvitation, QuizQns, UserRes } from "../models/quiz";

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

export const submitQuiz: RequestHandler = async (req, res, next) => {
	const { quizId } = req.params;
	try {
		const quizInvitation = await QuizInvitation.findOneAndUpdate(
			{
				quiz: new ObjectId(quizId),
				invitedTo: new ObjectId(req.user),
			},
			{ isAttempted: true }
		);
		return res.status(200).json({
			status: true,
			quizInvitation,
		});
	} catch (err) {
		next(err);
	}
};

export const getQuizResults: RequestHandler = async (req, res, next) => {
	try {
		const results = await QuizInvitation.aggregate([
			{
				$match: {
					invitedTo: new ObjectId(req.user),
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
	} catch (err) {
		next(err);
	}
};

export const getQuizResult: RequestHandler = async (req, res, next) => {
	const { quizId } = req.params;
	try {
		const result = await UserRes.find({
			user: new ObjectId(req.user),
			quiz: new ObjectId(quizId),
		}).populate("qns", "description options title");
		return res.status(200).json({
			status: true,
			result,
		});
	} catch (err) {
		next(err);
	}
};
