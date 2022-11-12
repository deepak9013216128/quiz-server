"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qns_1 = require("../controllers/qns");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.route("/").get(auth_1.protect, qns_1.getQns).post(auth_1.protect, qns_1.createQns);
router.route("/topics").get(auth_1.protect, qns_1.getTopics).post(auth_1.protect, qns_1.createTopic);
router
    .route("/topics/:topicId")
    .get(auth_1.protect, qns_1.getSubTopics)
    .post(auth_1.protect, qns_1.createSubTopic);
exports.default = router;
