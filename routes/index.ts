import { Router, Response, Request } from "express";
import { protect } from "../middleware/auth";
import userRoutes from "./user";
import qnsRoutes from "./qns";
import quizRoutes from "./quiz";
import studentRoutes from "./student";
import resultRoutes from "./result";

const router = Router();

router.use("/users", userRoutes);
router.use("/qns", qnsRoutes);
router.use("/quiz", quizRoutes);
router.use("/student", studentRoutes);
router.use("/results", resultRoutes);

router.get("/", (req: Request, res: Response) => {
	res.send("Express + TypeScript Server");
});

export default router;
