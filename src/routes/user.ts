import { Router, Response, Request } from "express";
import {
	changeUserRole,
	changeUserStatus,
	getUserProfile,
	getUsers,
	login,
	registerUser,
	sendInvitation,
} from "../controllers/user";
import { admin, protect } from "../middleware/auth";

const router = Router();

router.post("/login", login);

router.post("/invitation", protect, admin, sendInvitation);

router.post("/register", registerUser);

router.get("/profile", protect, getUserProfile);
router.put("/status", protect, admin, changeUserStatus);
router.put("/role", protect, admin, changeUserRole);
router.get("/", protect, admin, getUsers);

export default router;
