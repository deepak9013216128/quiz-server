import User from "../models/user";
import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import {
	generateInvitationToken,
	generateToken,
	verfiyToken,
} from "../utils/token";
import { ObjectId } from "mongodb";

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const login: RequestHandler = async (req, res, next) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email }).populate("password");
		if (user && (await user.matchPassword(password))) {
			if (user.status === "blocked") {
				res.status(401);
				next(new Error("You are blocked by admin."));
			}
			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				token: generateToken(user._id.toString()),
			});
		} else {
			res.status(401);
			next(new Error("Invalid email or password"));
		}
	} catch (err) {
		res.status(500);
		next(err);
	}
};

// @desc    Send invitation to a new user
// @route   POST /api/users/invitation
// @access  Private
export const sendInvitation: RequestHandler = async (req, res, next) => {
	const { name, email } = req.body;

	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			res.status(400);
			throw new Error("User already exists");
		}

		const token = generateInvitationToken(name, email, "student", "invited");

		res.json({
			invitationToken: token,
		});
	} catch (err) {
		res.status(500);
		next(err);
	}
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser: RequestHandler = async (req, res, next) => {
	const { token, password } = req.body;
	try {
		const newUser = verfiyToken(token);

		if (!newUser.isVerified) {
			res.status(401);
			next(new Error("Not authorized, invalid token"));
		}

		const userExists = await User.findOne({ email: newUser.email });

		if (userExists) {
			res.status(400);
			throw new Error("User already exists");
		}
		const user = await User.create({
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
				token: generateToken(user._id.toString()),
			});
		} else {
			res.status(400);
			throw new Error("Invalid user data");
		}
	} catch (err) {
		res.status(500);
		next(err);
	}
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile: RequestHandler = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id);

		if (user) {
			res.json({
				user,
			});
		} else {
			res.status(404);
			throw new Error("User not found");
		}
	} catch (err) {
		next(err);
	}
};

// @desc    Get users
// @route   GET /api/users
// @access  Private
export const getUsers: RequestHandler = async (req, res, next) => {
	try {
		const users = await User.find({});

		if (users) {
			res.json({
				users: users,
				status: true,
			});
		} else {
			res.status(404);
			throw new Error("User not found");
		}
	} catch (err) {
		next(err);
	}
};

// @desc    Change users status
// @route   PUT /api/users/status
// @access  Private
export const changeUserStatus: RequestHandler = async (req, res, next) => {
	const { userId, status } = req.body;
	try {
		const user = await User.findOneAndUpdate(
			{ _id: new ObjectId(userId) },
			{ status: status },
			{
				new: true,
			}
		);

		if (user) {
			res.json({
				user: user,
				status: true,
			});
		} else {
			res.status(404);
			throw new Error("User not found");
		}
	} catch (err) {
		next(err);
	}
};

// @desc    Change users role
// @route   PUT /api/users/role
// @access  Private
export const changeUserRole: RequestHandler = async (req, res, next) => {
	const { userId, role } = req.body;
	try {
		const user = await User.findOneAndUpdate(
			{ _id: new ObjectId(userId) },
			{ role: role },
			{
				new: true,
			}
		);

		if (user) {
			res.json({
				user: user,
				status: true,
			});
		} else {
			res.status(404);
			throw new Error("User not found");
		}
	} catch (err) {
		next(err);
	}
};
