import { ObjectId } from "mongodb";
import { model, Schema } from "mongoose";

const quizScehma = new Schema({
	title: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
	},
	user: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
});
quizScehma.post("save", function (error: any, doc: any, next: any) {
	if (error.name === "MongoServerError" && error.code === 11000) {
		next(new Error("Quiz already exit, please create new one."));
	} else {
		next();
	}
});

const quizQnsSchema = new Schema({
	quiz: {
		type: ObjectId,
		ref: "Quiz",
		required: true,
	},
	qns: {
		type: ObjectId,
		ref: "Qns",
		required: true,
	},
});

const quizInvitationSchema = new Schema({
	quiz: {
		type: ObjectId,
		ref: "Quiz",
		required: true,
	},
	invitedTo: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
	invitedBy: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
	isAttempted: {
		type: Boolean,
		default: false,
	},
});

const userResponseSchema = new Schema({
	quiz: {
		type: ObjectId,
		ref: "Quiz",
		required: true,
	},
	user: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
	qns: {
		type: ObjectId,
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

export const Quiz = model("Quiz", quizScehma);
export const QuizQns = model("QuizQns", quizQnsSchema);
export const QuizInvitation = model("QuizInvitation", quizInvitationSchema);
export const UserRes = model("UserRes", userResponseSchema);
