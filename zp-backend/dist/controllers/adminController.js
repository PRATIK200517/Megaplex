"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdmin = exports.logoutAdmin = exports.loginAdmin = exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const jwt_1 = require("../utils/jwt");
const zod_1 = require("zod");
// --- ZOD SCHEMAS ---
const adminCredentialsSchema = zod_1.z.object({
    username: zod_1.z.string().min(5, "Username must be at least 5 characters long"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long")
});
const loginCredentialsSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required"),
    password: zod_1.z.string().min(1, "Password is required")
});
const deleteAdminSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required"),
    password: zod_1.z.string().min(1, "Password is required")
});
// --- CONTROLLERS ---
const registerAdmin = async (req, res) => {
    try {
        const validation = adminCredentialsSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }
        const { username, password } = validation.data;
        const userExists = await prisma_1.default.admin.findFirst({
            where: {
                username: username
            }
        });
        if (userExists) {
            return res.status(400).json({ message: "User Already exists with this username. Please try with a different username" });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const admin = await prisma_1.default.admin.create({
            data: {
                username: username,
                password: hashedPassword
            }
        });
        if (admin) {
            return res.status(201).json({
                _id: admin.adminId,
                name: admin.username,
                // Note: It's generally a bad security practice to return the hashed password.
                // pass: admin.password 
            });
        }
        else {
            return res.status(500).json({ message: "Admin creation failed." });
        }
    }
    catch (e) {
        console.error("Register Admin Error:", e);
        return res.status(500).json({ message: "An unexpected server error occurred during registration." });
    }
};
exports.registerAdmin = registerAdmin;
const loginAdmin = async (req, res) => {
    try {
        const validation = loginCredentialsSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }
        const { username, password } = validation.data;
        const admin = await prisma_1.default.admin.findFirst({
            where: {
                username: username
            }
        });
        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, admin.password);
        if (isMatch) {
            // Note: Assuming generateToken is properly imported and defined
            const token = (0, jwt_1.generateToken)(admin.username);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
            });
            return res.status(200).json({
                _id: admin.adminId,
                username: admin.username,
            });
        }
        else {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
    }
    catch (error) {
        console.error("Login Admin Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during login." });
    }
};
exports.loginAdmin = loginAdmin;
const logoutAdmin = async (req, res) => {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout Admin Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during logout." });
    }
};
exports.logoutAdmin = logoutAdmin;
const deleteAdmin = async (req, res) => {
    try {
        const validation = deleteAdminSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }
        const { username, password } = validation.data;
        const userMatch = await prisma_1.default.admin.findUnique({
            where: {
                username: username,
            }
        });
        if (!userMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const passMatch = await bcryptjs_1.default.compare(password, userMatch.password);
        if (!passMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const deletedAdmin = await prisma_1.default.admin.delete({
            where: {
                adminId: userMatch.adminId
            }
        });
        if (deletedAdmin) {
            // Clear the cookie upon successful deletion
            res.cookie('jwt', '', {
                httpOnly: true,
                expires: new Date(0)
            });
            return res.status(200).json({ message: "Admin deleted successfully!" });
        }
    }
    catch (error) {
        console.error("Delete Admin Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during admin deletion." });
    }
};
exports.deleteAdmin = deleteAdmin;
