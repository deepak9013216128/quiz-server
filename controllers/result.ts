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
