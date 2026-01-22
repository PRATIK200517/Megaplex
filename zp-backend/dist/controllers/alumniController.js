"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAlumni = exports.getAlumni = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const zod_1 = require("zod");
// --- ZOD SCHEMAS ---
const uploadAlumniSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    designition: zod_1.z.string().min(1, "Designition is required"), // Assuming 'designition' is a typo for 'designation'
    instaUrl: zod_1.z.string().url("Invalid Instagram URL format").optional(),
    Xurl: zod_1.z.string().url("Invalid X (Twitter) URL format").optional(),
    LinkdeInUrl: zod_1.z.string().url("Invalid LinkedIn URL format").optional(),
    email: zod_1.z.string().email("Invalid email address format").optional(),
});
const getAlumniQuerySchema = zod_1.z.object({
// page: z.coerce.number().int().positive().optional(),
// limit: z.coerce.number().int().positive().optional(),
}).optional();
const getAlumni = async (req, res) => {
    try {
        const queryValidation = getAlumniQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({
                message: "Invalid query parameters",
                errors: queryValidation.error.format()
            });
        }
        const alumni = await prisma_1.default.alumni.findMany();
        if (alumni) {
            return res.status(200).json({
                alumni: alumni,
                message: "Alumni retrieved successfully"
            });
        }
        return res.status(500).json({
            alumni: [],
            message: "Database query did not return a result."
        });
    }
    catch (error) {
        console.error("Error retrieving Alumni:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred while retrieving alumni."
        });
    }
};
exports.getAlumni = getAlumni;
const uploadAlumni = async (req, res) => {
    try {
        const validation = uploadAlumniSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }
        const { name, designition, instaUrl, Xurl, LinkdeInUrl, email } = validation.data;
        const alumni = await prisma_1.default.alumni.create({
            data: {
                name: name,
                designition: designition,
                instaUrl: instaUrl,
                xurl: Xurl,
                linkedIn: LinkdeInUrl,
                email: email
            }
        });
        if (alumni) {
            return res.status(201).json({ message: "Alumni uploaded successfully!", alumniId: alumni.id });
        }
        else {
            return res.status(500).json({ message: "Database error while uploading Alumni." });
        }
    }
    catch (error) {
        console.error("Upload Alumni Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during Alumni upload." });
    }
};
exports.uploadAlumni = uploadAlumni;
