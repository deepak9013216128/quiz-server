"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/login", user_1.login);
router.post("/invitation", auth_1.protect, auth_1.admin, user_1.sendInvitation);
router.post("/register", user_1.registerUser);
router.get("/profile", auth_1.protect, user_1.getUserProfile);
router.get("/", auth_1.protect, auth_1.admin, user_1.getUsers);
exports.default = router;
