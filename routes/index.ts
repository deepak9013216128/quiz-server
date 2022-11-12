import { Router, Response, Request } from "express";
import { protect } from "../middleware/auth";
import userRoutes from "./user";
import qnsRoutes from "./qns";
import quizRoutes from "./quiz";
import studentRoutes from "./student";

const router = Router();

router.use("/users", userRoutes);
router.use("/qns", qnsRoutes);
router.use("/quiz", quizRoutes);
router.use("/student", studentRoutes);

router.get("/", (req: Request, res: Response) => {
	res.send("Express + TypeScript Server");
});

export default router;
