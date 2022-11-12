"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubTopic = exports.Topic = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = require("mongoose");
const qnsSchema = new mongoose_1.Schema({
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
        type: mongodb_1.ObjectId,
        ref: "Topic",
    },
    subTopic: {
        type: mongodb_1.ObjectId,
        ref: "SubTopic",
    },
    user: {
        type: mongodb_1.ObjectId,
        ref: "User",
    },
});
const Qns = (0, mongoose_1.model)("Qns", qnsSchema);
const subTopicSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    topic: {
        type: mongodb_1.ObjectId,
        ref: "Topic",
    },
    description: String,
});
const topicSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: String,
});
topicSchema.post("save", function (error, doc, next) {
    if (error.name === "MongoServerError" && error.code === 11000) {
        next(new Error("Topic already exit, please create new one."));
    }
    else {
        next();
    }
});
exports.Topic = (0, mongoose_1.model)("Topic", topicSchema);
exports.SubTopic = (0, mongoose_1.model)("SubTopic", subTopicSchema);
exports.default = Qns;
