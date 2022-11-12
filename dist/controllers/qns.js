"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQns = exports.createQns = exports.getSubTopics = exports.createSubTopic = exports.getTopics = exports.createTopic = void 0;
const mongodb_1 = require("mongodb");
const qns_1 = __importStar(require("../models/qns"));
const createTopic = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description } = req.body;
    try {
        if (req.user.role !== "admin" && req.user.role !== "instructor") {
            res.status(403);
            throw new Error("Not authorized to create topic.");
        }
        const topic = new qns_1.Topic({ title, description });
        yield topic.save();
        return res.status(201).json({
            message: "Topic created.",
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createTopic = createTopic;
const getTopics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topic = yield qns_1.Topic.find({});
        return res.status(200).json({
            topic: topic,
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getTopics = getTopics;
const createSubTopic = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description } = req.body;
    const { topicId } = req.params;
    try {
        if (req.user.role !== "admin" && req.user.role !== "instructor") {
            res.status(403);
            throw new Error("Not authorized to create sub topic.");
        }
        const subTopic = new qns_1.SubTopic({
            topic: new mongodb_1.ObjectId(topicId),
            title,
            description,
        });
        yield subTopic.save();
        return res.status(201).json({
            message: "SubTopic created.",
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createSubTopic = createSubTopic;
const getSubTopics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { topicId } = req.params;
    try {
        const subTopic = yield qns_1.SubTopic.find({
            topic: new mongodb_1.ObjectId(topicId),
        }).populate("topic");
        return res.status(200).json({
            subTopic: subTopic !== null && subTopic !== void 0 ? subTopic : [],
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getSubTopics = getSubTopics;
const createQns = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, correctChoice, durationOfQns, points, options, topic, subTopic, } = req.body;
    try {
        if (req.user.role !== "admin" && req.user.role !== "instructor") {
            res.status(403);
            throw new Error("Not authorized to create qns");
        }
        const qns = new qns_1.default({
            title,
            description,
            points,
            topic: new mongodb_1.ObjectId(topic),
            subTopic: new mongodb_1.ObjectId(subTopic),
            correctChoice,
            durationOfQns,
            options,
            user: new mongodb_1.ObjectId(req.user),
        });
        yield qns.save();
        return res.status(201).json({
            message: "Qns created.",
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createQns = createQns;
const getQns = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { topicId, subTopicId } = req.query;
    try {
        const query = {};
        if (topicId)
            query.topic = new mongodb_1.ObjectId(topicId);
        if (subTopicId)
            query.subTopic = new mongodb_1.ObjectId(subTopicId);
        const qns = yield qns_1.default.find(query).populate("topic subTopic user");
        return res.status(200).json({
            qns: qns !== null && qns !== void 0 ? qns : [],
            status: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getQns = getQns;
