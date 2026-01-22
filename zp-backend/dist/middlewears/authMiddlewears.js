"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const protect = async (req, res, next) => {
    let token;
    token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await prisma_1.default.admin.findUnique({
                where: { username: decoded.username }
            });
            if (!user) {
                return res.status(401).json({ message: "user not found (Invalid Token)" });
            }
            req.user = user;
            next();
        }
        catch (error) {
            console.log(error);
        }
    }
    else {
        res.status(401).json({ message: "Not authorized,no token found" });
    }
};
exports.protect = protect;
