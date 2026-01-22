import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { z } from "zod";

// --- ZOD SCHEMAS ---

const uploadNoticeSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    expiry: z.coerce.date().optional(),
});

const deleteNoticeSchema = z.object({
    id: z.coerce.number().int("ID must be an integer").positive("ID must be positive"),
});


// --- CONTROLLERS ---

export const getNotices = async (req: Request, res: Response) => {
    try {
        const notices = await prisma.notices.findMany();

        return res.status(200).json({ 
            notices: notices,
            message: "Notices retrieved successfully"
        });
        
    } catch (error) {
        console.error("Error retrieving notices:", error); 
        return res.status(500).json({ 
            message: "An unexpected server error occurred while retrieving notices."
        });
    }
}


export const uploadNotice = async (req: Request, res: Response) => {
    try {
        const validation = uploadNoticeSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }

        const { title, description, expiry } = validation.data;

        const notice = await prisma.notices.create({
            data: {
                title: title,
                description: description,
                expiry: expiry, 
            }
        });

        if (notice) {
            return res.status(201).json({ message: "Notice uploaded successfully!", noticeId: notice.id });
        } else {
            return res.status(500).json({ message: "Database error while uploading Notice." });
        }
    } catch (error) {
        console.error("Upload Notice Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during Notice upload." });
    }
}

export const deleteNotice = async (req: Request, res: Response) => {
    try {
        // Extract and validate the ID from route parameters
        const { id } = req.params;
        
        // Create a validation object with the id
        const validation = deleteNoticeSchema.safeParse({ id });

        if (!validation.success) {
            return res.status(400).json({ 
                message: "Invalid notice ID", 
                errors: validation.error.format() 
            });
        }
        
        const noticeId = validation.data.id;

        // Check if notice exists
        const notice = await prisma.notices.findUnique({
            where: { id: noticeId }
        });

        if (!notice) {
            return res.status(404).json({ 
                message: `Notice with ID ${noticeId} not found.` 
            });
        }

        // Delete the notice
        await prisma.notices.delete({
            where: { id: noticeId }
        });

        return res.status(200).json({ 
            message: "Notice deleted successfully",
            deletedNotice: {
                id: notice.id,
                title: notice.title
            }
        });
        
    } catch (error) {
        console.error("Delete Notice Error:", error);
        return res.status(500).json({ 
            message: "An unexpected server error occurred during notice deletion." 
        });
    }
}