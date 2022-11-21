import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { QuizInvitation, QuizQns, UserRes } from "../models/quiz";

export const getUserQuizResult: RequestHandler = async (req, res, next) => {
	const { quizId, userId } = req.params;

	if (req.user.role !== "admin" && req.user.role !== "instructor") {
		res.status(403);
		throw new Error("Not authorized to fetch quiz result.");
	}
	try {
		const result = await UserRes.find({
			user: new ObjectId(userId),
			quiz: new ObjectId(quizId),
		}).populate("qns user", "description options title name email");
		return res.status(200).json({
			status: true,
			result,
		});
	} catch (err) {
		next(err);
	}
};

export const getQuizResults: RequestHandler = async (req, res, next) => {
	const { quizId } = req.params;

	if (req.user.role !== "admin" && req.user.role !== "instructor") {
		res.status(403);
		throw new Error("Not authorized to fetch quiz result.");
	}
	try {
		const results = await QuizInvitation.find({
			quiz: new ObjectId(quizId),
			invitedBy: new ObjectId(req.user),
		}).populate("invitedTo quiz", "name email title");
		return res.status(200).json({
			status: true,
			results,
		});
	} catch (err) {
		next(err);
	}
};

export const getUsersResults: RequestHandler = async (req, res, next) => {
	if (req.user.role !== "admin" && req.user.role !== "instructor") {
		res.status(403);
		throw new Error("Not authorized to fetch quiz result.");
	}
	try {
		const results = await QuizInvitation.aggregate([
			{
				$match: {
					invitedBy: new ObjectId(req.user),
				},
			},
			{
				$group: {
					_id: "$invitedTo",
					quizInvited: { $count: {} },
					quizAttempted: {
						$sum: {
							$cond: ["$isAttempted", 1, 0],
						},
					},
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{
				$project: {
					user: {
						name: 1,
						email: 1,
						_id: 1,
					},
					_id: 1,
					quizInvited: 1,
					quizAttempted: 1,
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

export const getUserResults: RequestHandler = async (req, res, next) => {
	const { userId } = req.params;
	if (req.user.role !== "admin" && req.user.role !== "instructor") {
		res.status(403);
		throw new Error("Not authorized to fetch quiz result.");
	}
	try {
		const results = await QuizInvitation.aggregate([
			{
				$match: {
					invitedTo: new ObjectId(userId),
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
					from: "quizzes",
					localField: "quiz",
					foreignField: "_id",
					as: "quiz",
				},
			},
			{ $unwind: "$quiz" },
			{
				$project: {
					isAttempted: 1,
					noOfQns: { $size: "$qns" },

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
