import { ObjectId } from "mongodb";
import mongoose, { model, Schema } from "mongoose";

const qnsSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	correctChoice: {
		type: Number,
		required: true,
	},
	description: String,
	imageUrl: String,
	status: {
		type: String,
		required: true,
		enum: ["active", "blocked"],
		default: "active",
	},
	durationOfQns: {
		type: Number,
		default: 30,
	},
	qnsUsed: { type: Number, default: 0 },
	options: {
		type: [String],
	},
	points: {
		type: Number,
		default: 1,
		enum: [1, 2, 3, 4, 5],
	},
	topic: {
		type: ObjectId,
		ref: "Topic",
	},
	subTopic: {
		type: ObjectId,
		ref: "SubTopic",
	},
	user: {
		type: ObjectId,
		ref: "User",
	},
});

const Qns = model("Qns", qnsSchema);

const subTopicSchema = new Schema({
	title: {
		type: String,
		required: true,
		unique: true,
	},
	topic: {
		type: ObjectId,
		ref: "Topic",
	},
	description: String,
});

const topicSchema = new Schema({
	title: {
		type: String,
		required: true,
		unique: true,
	},
	description: String,
});
topicSchema.post("save", function (error: any, doc: any, next: any) {
	if (error.name === "MongoServerError" && error.code === 11000) {
		next(new Error("Topic already exit, please create new one."));
	} else {
		next();
	}
});

export const Topic = model("Topic", topicSchema);
export const SubTopic = model("SubTopic", subTopicSchema);
export default Qns;
