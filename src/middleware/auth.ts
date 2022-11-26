import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

const protect = async (req: Request, res: Response, next: NextFunction) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			token = req.headers.authorization.split(" ")[1];

			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET as string
			) as any;
			if (!decoded) {
				next(new Error("Not authorized"));
			}
			req.user = await User.findById(decoded.id);
			if (req.user.status === "blocked") {
				res.status(401);
				next(new Error("You are blocked by admin."));
			}
			next();
		} catch (error) {
			console.error(error);
			res.status(401);
			next(new Error("Not authorized, token failed"));
		}
	}

	if (!token) {
		res.status(401);
		next(new Error("Not authorized, no token"));
	}
};

const admin = (req: Request, res: Response, next: NextFunction) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		res.status(401);
		next(new Error("Not authorized as an admin"));
	}
};

export { protect, admin };
