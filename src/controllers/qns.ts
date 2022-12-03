import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import Qns, { SubTopic, Topic } from "../models/qns";

export const createTopic: RequestHandler = async (req, res, next) => {
	const { title, description } = req.body;
	try {
		if (req.user.role !== "admin" && req.user.role !== "instructor") {
			res.status(403);
			throw new Error("Not authorized to create topic.");
		}
		const topic = new Topic({ title, description });
		await topic.save();

		return res.status(201).json({
			message: "Topic created.",
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const getTopics: RequestHandler = async (req, res, next) => {
	try {
		// const topic = await Topic.find({});
		const topic = await Topic.aggregate([
			{ $match: {} },
			{
				$lookup: {
					from: "subtopics",
					localField: "_id",
					foreignField: "topic",
					as: "subTopic",
				},
			},
			{
				$project: {
					title: 1,
					description: 1,
					_id: 1,
					subTopicCount: { $size: "$subTopic" },
				},
			},
		]);
		return res.status(200).json({
			topic: topic,
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const createSubTopic: RequestHandler = async (req, res, next) => {
	const { title, description } = req.body;
	const { topicId } = req.params;
	try {
		if (req.user.role !== "admin" && req.user.role !== "instructor") {
			res.status(403);
			throw new Error("Not authorized to create sub topic.");
		}
		const subTopic = new SubTopic({
			topic: new ObjectId(topicId),
			title,
			description,
		});
		await subTopic.save();

		return res.status(201).json({
			message: "SubTopic created.",
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const getSubTopics: RequestHandler = async (req, res, next) => {
	const { topicId } = req.params;
	try {
		const subTopic = await SubTopic.find({
			topic: new ObjectId(topicId),
		}).populate("topic");
		return res.status(200).json({
			subTopic: subTopic ?? [],
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const createQns: RequestHandler = async (req, res, next) => {
	const {
		title,
		description,
		correctChoice,
		durationOfQns,
		points,
		options,
		topic,
		subTopic,
	} = req.body;
	try {
		if (req.user.role !== "admin" && req.user.role !== "instructor") {
			res.status(403);
			throw new Error("Not authorized to create qns");
		}
		const qns = new Qns({
			title,
			description,
			points,
			topic: new ObjectId(topic),
			subTopic: new ObjectId(subTopic),
			correctChoice,
			durationOfQns,
			options,
			user: new ObjectId(req.user),
		});
		await qns.save();
		return res.status(201).json({
			message: "Qns created.",
			status: true,
		});
	} catch (err) {
		next(err);
	}
};

export const getQns: RequestHandler = async (req, res, next) => {
	const { topicId, subTopicId }: any = req.query;
	try {
		interface queryInterface {
			[key: string]: any;
		}
		const query: queryInterface = {};
		if (topicId) query.topic = new ObjectId(topicId);
		if (subTopicId) query.subTopic = new ObjectId(subTopicId);

		const qns = await Qns.find(query).populate("topic subTopic user");
		return res.status(200).json({
			qns: qns ?? [],
			status: true,
		});
	} catch (err) {
		next(err);
	}
};
