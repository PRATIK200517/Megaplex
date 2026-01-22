"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadNotice = exports.getNotices = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const zod_1 = require("zod");
// --- ZOD SCHEMAS ---
const uploadNoticeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    expiry: zod_1.z.coerce.date().optional(),
});
// --- CONTROLLERS ---
const getNotices = async (req, res) => {
    try {
        const notices = await prisma_1.default.notices.findMany();
        return res.status(200).json({
            notices: notices,
            message: "Notices retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error retrieving notices:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred while retrieving notices."
        });
    }
};
exports.getNotices = getNotices;
const uploadNotice = async (req, res) => {
    try {
        const validation = uploadNoticeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }
        const { title, description, expiry } = validation.data;
        const notice = await prisma_1.default.notices.create({
            data: {
                title: title,
                description: description,
                expiry: expiry,
            }
        });
        if (notice) {
            return res.status(201).json({ message: "Notice uploaded successfully!", noticeId: notice.id });
        }
        else {
            return res.status(500).json({ message: "Database error while uploading Notice." });
        }
    }
    catch (error) {
        console.error("Upload Notice Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during Notice upload." });
    }
};
exports.uploadNotice = uploadNotice;
