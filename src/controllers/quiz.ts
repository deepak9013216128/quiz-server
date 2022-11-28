import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { Aggregate, Model, model } from "mongoose";
import Qns from "../models/qns";
import { Quiz, QuizInvitation, QuizQns, UserRes } from "../models/quiz";
import User from "../models/user";

export const createQuiz: RequestHandler = async (req, res, next) => {
	const { title, description } = req.body;
	try {
		if (req.user.role !== "admin" && req.user.role !== "instructor") {
			res.status(403);
			throw new Error("Not authorized to create quiz.");
		}
		const quiz = new Quiz({ title, description, user: new ObjectId(req.user) });
		await quiz.save();

		return res.status(201).json({
			message: "Quiz created.",
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const getQuiz: RequestHandler = async (req, res, next) => {
	try {
		let quiz;
		if (req.user.role === "student") {
			quiz = await QuizInvitation.aggregate([
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
							_id: 1,
							title: 1,
							description: 1,
						},
					},
				},
			]);
		} else {
			quiz = await Quiz.aggregate([
				{ $match: { user: new ObjectId(req.user) } },
				{
					$lookup: {
						from: "quizqns", // collection name in db
						localField: "_id",
						foreignField: "quiz",
						as: "noOfQns",
					},
				},
				{
					$lookup: {
						from: "quizinvitations", // collection name in db
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
	} catch (err) {
		next(err);
	}
};

export const addQnsInQuiz: RequestHandler = async (req, res, next) => {
	const { qnsId } = req.body;
	const { quizId } = req.params;
	try {
		if (req.user.role !== "admin" && req.user.role !== "instructor") {
			res.status(403);
			throw new Error("Not authorized to add qns in quiz.");
		}
		const doesExit = await QuizQns.exists({
			quiz: new ObjectId(quizId),
			qns: new ObjectId(qnsId),
		});

		if (doesExit) {
			return res.status(422).json({
				message: "Qns already exit in quiz.",
				status: false,
			});
		}
		const qns = await Qns.findByIdAndUpdate(qnsId, { $inc: { qnsUsed: 1 } });

		const quizQns = new QuizQns({
			quiz: new ObjectId(quizId),
			qns: new ObjectId(qnsId),
		});
		await quizQns.save();

		return res.status(201).json({
			message: "Qns added in quiz.",
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const removeQnsFromQuiz: RequestHandler = async (req, res, next) => {
	const { qnsId } = req.body;
	const { quizId } = req.params;
	console.log(qnsId, quizId);
	try {
		if (req.user.role !== "admin" && req.user.role !== "instructor") {
			res.status(403);
			throw new Error("Not authorized to add qns in quiz.");
		}

		const qns = await Qns.findByIdAndUpdate(qnsId, { $inc: { qnsUsed: -1 } });

		const quizQns = await QuizQns.findOneAndRemove({
			quiz: new ObjectId(quizId),
			qns: new ObjectId(qnsId),
		});

		return res.status(200).json({
			message: "Qns remove from quiz.",
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const getQnsFromQuiz: RequestHandler = async (req, res, next) => {
	const { quizId } = req.params;
	try {
		let quizQns;
		if (req.user.role === "student") {
			const result = await QuizInvitation.findOne({
				invitedTo: new ObjectId(req.user),
				quiz: new ObjectId(quizId),
			}).select("isAttempted");
			if (result?.isAttempted)
				return res.status(200).json({
					quizQns: [],
					message: "Quiz link is expired!",
					status: false,
				});
			quizQns = await QuizQns.find({ quiz: new ObjectId(quizId) }).populate(
				"qns",
				"title description durationOfQns options points"
			);
		} else {
			quizQns = await QuizQns.find({ quiz: new ObjectId(quizId) }).populate(
				"qns",
				{}
			);
		}
		return res.status(200).json({
			quizQns: quizQns,
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const sendQuizInvitation: RequestHandler = async (req, res, next) => {
	const { email, quizId } = req.body;
	try {
		if (req.user.role !== "admin" && req.user.role !== "instructor") {
			res.status(403);
			throw new Error("Not authorized to send quiz inivition.");
		}
		const invitedTo = await User.findOne({ email }).select("_id role");
		if (!invitedTo) {
			res.status(422);
			throw new Error(
				`User of ${email} not Found, please send invitation to ${email}`
			);
		}

		if (invitedTo.role !== "student") {
			res.status(422);
			throw new Error(
				`You don't have permission to send inviation to ${email}`
			);
		}

		const doesExit = await QuizInvitation.exists({
			quiz: new ObjectId(quizId),
			invitedTo: new ObjectId(invitedTo._id),
		});

		if (doesExit) {
			return res.status(422).json({
				message: "Quiz invitation already sent.",
				status: false,
			});
		}
		const quizInvitation = new QuizInvitation({
			quiz: new ObjectId(quizId),
			invitedTo: new ObjectId(invitedTo._id),
			invitedBy: new ObjectId(req.user),
		});
		await quizInvitation.save();

		return res.status(201).json({
			message: "Quiz invitation sent.",
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const getQuizInvitation: RequestHandler = async (req, res, next) => {
	try {
		if (req.user.role !== "admin" && req.user.role !== "instructor") {
			res.status(403);
			throw new Error("Not authorized to fetch quiz inivition.");
		}

		const quizInvitation = await QuizInvitation.find({
			invitedBy: new ObjectId(req.user),
		}).populate("invitedTo quiz", "name email title");

		return res.status(200).json({
			quizInvitation: quizInvitation,
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const createQnsResponse: RequestHandler = async (req, res, next) => {
	const { qnsId, quizId } = req.params;
	const { ans, timeTaken } = req.body;
	try {
		if (req.user.role === "admin" || req.user.role === "instructor") {
			res.status(403);
			throw new Error("Not authorized.");
		}

		const qns = await Qns.findById(qnsId);
		let userRes = await UserRes.findOne({
			user: new ObjectId(req.user),
			qns: new Object(qnsId),
			quiz: new Object(quizId),
		});
		if (!userRes) {
			userRes = new UserRes({
				user: new ObjectId(req.user),
				qns: new Object(qnsId),
				quiz: new Object(quizId),
				ans: ans,
				points: ans === -1 ? 0 : ans === qns?.correctChoice ? qns?.points : 0,
				timeTaken,
			});
		} else {
			userRes.ans = ans;
			userRes.timeTaken = timeTaken;
			userRes.points =
				ans === -1
					? 0
					: ans === qns?.correctChoice
					? (qns?.points as number)
					: 0;
		}
		await userRes.save();

		return res.status(200).json({
			message: "Qns response created.",
			data: userRes,
			status: true,
		});
	} catch (err) {
		next(err);
	}
};
