"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("./user"));
const qns_1 = __importDefault(require("./qns"));
const quiz_1 = __importDefault(require("./quiz"));
const student_1 = __importDefault(require("./student"));
const result_1 = __importDefault(require("./result"));
const router = (0, express_1.Router)();
router.use("/users", user_1.default);
router.use("/qns", qns_1.default);
router.use("/quiz", quiz_1.default);
router.use("/student", student_1.default);
router.use("/results", result_1.default);
router.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
exports.default = router;
