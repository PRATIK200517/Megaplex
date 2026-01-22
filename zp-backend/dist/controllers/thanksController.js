"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThanksbyId = exports.getThanks = exports.deleteThanks = exports.uploadThanks = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const imageKit_1 = __importDefault(require("../lib/imageKit"));
const zod_1 = require("zod");
// --- ZOD SCHEMAS ---
// 1. Schema for the individual image object (likely stored as JSON in the DB)
const ImageSchema = zod_1.z.object({
    fileId: zod_1.z.string().nonempty("Image fileId is required"),
    url: zod_1.z.string().url("Image URL must be a valid URL"),
    height: zod_1.z.number().int().optional(),
    width: zod_1.z.number().int().optional(),
});
const uploadThanksSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, "Title must be at least 5 characters long"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters long"),
    content: zod_1.z.string().min(50, "Content must be at least 50 characters long"),
    images: zod_1.z.array(ImageSchema).min(1, "At least one image is required"),
    isFeatured: zod_1.z.boolean(),
});
const thanksIdParamSchema = zod_1.z.object({
    thanksId: zod_1.z.coerce.number().int("ID must be an integer").positive("ID must be positive"),
});
// --- CONTROLLERS ---
const uploadThanks = async (req, res) => {
    try {
        const validation = uploadThanksSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }
        const { title, description, content, images, isFeatured } = validation.data;
        const thanks = await prisma_1.default.thanks.create({
            data: {
                title: title,
                description: description,
                content: content,
                images: images,
                isFeatured: isFeatured
            }
        });
        return res.status(201).json({
            message: "Special Thanks uploaded successfully!",
            thanksId: thanks.id
        });
    }
    catch (error) {
        console.error("Upload Special Thanks Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during upload." });
    }
};
exports.uploadThanks = uploadThanks;
const deleteThanks = async (req, res) => {
    try {
        const validation = thanksIdParamSchema.safeParse(req.params);
        if (!validation.success) {
            return res.status(400).json({
                message: "Invalid route parameter",
                errors: validation.error.format()
            });
        }
        const thanksIdNumber = validation.data.thanksId;
        const thanksRecord = await prisma_1.default.thanks.findUnique({
            where: { id: thanksIdNumber },
            select: { images: true }
        });
        if (!thanksRecord) {
            return res.status(404).json({ message: `Special Thank with ID ${thanksIdNumber} not found.` });
        }
        const imageArray = thanksRecord.images;
        const imageArrayValidation = zod_1.z.array(ImageSchema).safeParse(imageArray);
        if (imageArrayValidation.success) {
            const fileIds = imageArrayValidation.data.map(imageObject => imageObject.fileId);
            if (fileIds.length > 0) {
                try {
                    await imageKit_1.default.bulkDeleteFiles(fileIds);
                }
                catch (ikError) {
                    console.error("ImageKit Cleanup Error (soft fail):", ikError);
                }
            }
        }
        else {
            console.warn(`Corrupted image data structure found for ID ${thanksIdNumber}:`, imageArrayValidation.error.format());
        }
        await prisma_1.default.thanks.delete({
            where: { id: thanksIdNumber }
        });
        return res.status(200).json({ message: "Special Thank deleted successfully" });
    }
    catch (error) {
        console.error("Delete Special Thanks Error:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred during Special Thanks deletion."
        });
    }
};
exports.deleteThanks = deleteThanks;
const getThanks = async (req, res) => {
    try {
        const thanks = await prisma_1.default.thanks.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                images: true,
                isFeatured: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
        return res.status(200).json({
            thanks: thanks,
            message: "Special Thanks retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error retrieving Special Thanks list:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred while retrieving Special Thanks."
        });
    }
};
exports.getThanks = getThanks;
const getThanksbyId = async (req, res) => {
    try {
        const validation = thanksIdParamSchema.safeParse(req.params);
        if (!validation.success) {
            return res.status(400).json({
                message: "Invalid route parameter",
                errors: validation.error.format()
            });
        }
        const thanksIdNumber = validation.data.thanksId;
        const thank = await prisma_1.default.thanks.findUnique({
            where: { id: thanksIdNumber }
        });
        if (thank) {
            return res.status(200).json({
                thank: thank,
                message: "Special Thanks retrieved successfully"
            });
        }
        else {
            return res.status(404).json({
                message: `Special Thanks with ID ${thanksIdNumber} not found.`
            });
        }
    }
    catch (error) {
        console.error("Error retrieving Special Thanks by ID:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred while retrieving the Special thanks."
        });
    }
};
exports.getThanksbyId = getThanksbyId;
