"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const routes_1 = __importDefault(require("./routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const error_1 = require("./middleware/error");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = "mongodb+srv://deepak:LHMWm5mwySFXRj8@nodejs.zz6dw.mongodb.net/quiz?retryWrites=true&w=majority";
app.use((0, cors_1.default)());
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
app.use(body_parser_1.default.json());
app.use("/api", routes_1.default);
app.use(error_1.notFound);
app.use(error_1.errorHandler);
mongoose_1.default
    .connect(MONGODB_URI)
    .then((result) => {
    app.listen(PORT, () => {
        console.log(`⚡️[server]: Server is running at: ${PORT}`);
    });
})
    .catch((err) => {
    console.log(err);
});
