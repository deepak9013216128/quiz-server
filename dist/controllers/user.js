"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getUserProfile = exports.registerUser = exports.sendInvitation = exports.login = void 0;
const user_1 = __importDefault(require("../models/user"));
const token_1 = require("../utils/token");
// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_1.default.findOne({ email }).populate("password");
        if (user && (yield user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: (0, token_1.generateToken)(user._id.toString()),
            });
        }
        else {
            res.status(401);
            next(new Error("Invalid email or password"));
        }
    }
    catch (err) {
        res.status(500);
        next(err);
    }
});
exports.login = login;
// @desc    Send invitation to a new user
// @route   POST /api/users/invitation
// @access  Private
const sendInvitation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    try {
        const userExists = yield user_1.default.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }
        const token = (0, token_1.generateInvitationToken)(name, email, "student", "invited");
        res.json({
            invitationToken: token,
        });
    }
    catch (err) {
        res.status(500);
        next(err);
    }
});
exports.sendInvitation = sendInvitation;
// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    try {
        const newUser = (0, token_1.verfiyToken)(token);
        if (!newUser.isVerified) {
            res.status(401);
            next(new Error("Not authorized, invalid token"));
        }
        const userExists = yield user_1.default.findOne({ email: newUser.email });
        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }
        const user = yield user_1.default.create({
            name: newUser.name,
            email: newUser.email,
            password,
            status: "active",
            role: newUser.role,
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: (0, token_1.generateToken)(user._id.toString()),
            });
        }
        else {
            res.status(400);
            throw new Error("Invalid user data");
        }
    }
    catch (err) {
        res.status(500);
        next(err);
    }
});
exports.registerUser = registerUser;
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.user._id);
        if (user) {
            res.json({
                user,
            });
        }
        else {
            res.status(404);
            throw new Error("User not found");
        }
    }
    catch (err) {
        next(err);
    }
});
exports.getUserProfile = getUserProfile;
// @desc    Get users
// @route   GET /api/users
// @access  Private
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.find({});
        if (users) {
            res.json({
                users: users,
                status: true,
            });
        }
        else {
            res.status(404);
            throw new Error("User not found");
        }
    }
    catch (err) {
        next(err);
    }
});
exports.getUsers = getUsers;
