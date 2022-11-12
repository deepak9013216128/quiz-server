"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verfiyToken = exports.generateInvitationToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
exports.generateToken = generateToken;
const generateInvitationToken = (name, email, role, status) => {
    return jsonwebtoken_1.default.sign({ name, email, role, status }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};
exports.generateInvitationToken = generateInvitationToken;
const verfiyToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return {
            isVerified: false,
        };
    }
    console.log(decoded);
    return {
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        isVerified: true,
    };
};
exports.verfiyToken = verfiyToken;
