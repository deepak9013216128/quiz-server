import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import routes from "./src/routes";
import { notFound, errorHandler } from "./src/middleware/error";

dotenv.config();

const app: Express = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.zz6dw.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

app.use(cors());
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}
app.use(bodyParser.json());

declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

mongoose
	.connect(MONGODB_URI)
	.then((result) => {
		app.listen(PORT, () => {
			console.log(`⚡️[server]: Server is running at: ${PORT}`);
		});
	})
	.catch((err) => {
		console.log(err);
	});
