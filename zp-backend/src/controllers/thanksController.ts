import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import imagekit from '../lib/imageKit';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// --- ZOD SCHEMAS ---

// 1. Schema for the individual image object (likely stored as JSON in the DB)
const ImageSchema = z.object({
    fileId: z.string().nonempty("Image fileId is required"),
    url: z.string().url("Image URL must be a valid URL"),
    height: z.number().int().optional(),
    width: z.number().int().optional(),
});

const uploadThanksSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    content: z.string().min(50, "Content must be at least 50 characters long"),
    images: z.array(ImageSchema).min(1, "At least one image is required"),
    isFeatured: z.boolean(),
});

const thanksIdParamSchema = z.object({
    thanksId: z.coerce.number().int("ID must be an integer").positive("ID must be positive"),
});

// --- TYPES ---
type ThanksIdParams = z.infer<typeof thanksIdParamSchema>;

// --- CONTROLLERS ---

export const uploadThanks = async (req: Request, res: Response) => {
    try {
        const validation = uploadThanksSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }

        const { title, description, content, images, isFeatured } = validation.data;

        const thanks = await prisma.thanks.create({
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
        
    } catch (error) {
        console.error("Upload Special Thanks Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during upload." });
    }
}



export const deleteThanks = async (req: Request, res: Response) => {
    try {
        const validation = thanksIdParamSchema.safeParse({
            thanksId:req.params.id
        });

        if (!validation.success) {
            return res.status(400).json({ 
                message: "Invalid route parameter", 
                errors: validation.error.format() 
            });
        }
        
        const thanksIdNumber = validation.data.thanksId;

        const thanksRecord = await prisma.thanks.findUnique({
            where: { id: thanksIdNumber },
            select: { images: true }
        });

        if (!thanksRecord) {
            return res.status(404).json({ message: `Special Thank with ID ${thanksIdNumber} not found.` });
        }

        const imageArray = thanksRecord.images;

        const imageArrayValidation = z.array(ImageSchema).safeParse(imageArray);

        if (imageArrayValidation.success) {
            const fileIds = imageArrayValidation.data.map(imageObject => imageObject.fileId);

            if (fileIds.length > 0) {
                try {
                    await imagekit.bulkDeleteFiles(fileIds);
                } catch (ikError) {
                    console.error("ImageKit Cleanup Error (soft fail):", ikError);
                }
            }
        } else {
            console.warn(`Corrupted image data structure found for ID ${thanksIdNumber}:`, imageArrayValidation.error.format());
        }

        await prisma.thanks.delete({
            where: { id: thanksIdNumber }
        });

        return res.status(200).json({ message: "Special Thank deleted successfully" });
        
    } catch (error) {
        console.error("Delete Special Thanks Error:", error);
        return res.status(500).json({ 
            message: "An unexpected server error occurred during Special Thanks deletion." 
        });
    }
}

export const getThanks = async (req: Request, res: Response) => {
    try {
        const thanks = await prisma.thanks.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                images:true,
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
        
    } catch (error) {
        console.error("Error retrieving Special Thanks list:", error); 
        return res.status(500).json({ 
            message: "An unexpected server error occurred while retrieving Special Thanks."
        });
    }
}

export const getThanksbyId = async (req: Request<ThanksIdParams>, res: Response) => {
    try {
        const validation = thanksIdParamSchema.safeParse(req.params);

        if (!validation.success) {
            return res.status(400).json({ 
                message: "Invalid route parameter", 
                errors: validation.error.format() 
            });
        }

        const thanksIdNumber = validation.data.thanksId
       
        const thank = await prisma.thanks.findUnique({
            where: { id: thanksIdNumber }
        });

        if (thank) {
            return res.status(200).json({ 
                thank: thank,
                message: "Special Thanks retrieved successfully"
            });
        } else {
            return res.status(404).json({  
                message: `Special Thanks with ID ${thanksIdNumber} not found.`
            });
        }
    } catch (error) {
        console.error("Error retrieving Special Thanks by ID:", error); 
        return res.status(500).json({ 
            message: "An unexpected server error occurred while retrieving the Special thanks."
        });
    }
}

export const searchThanks = async (req: Request, res: Response) => {
    try {
        const { title } = req.query;
        
        if (!title || typeof title !== 'string') {
            return res.status(400).json({ message: "Search query is required" });
        }

        const thanks = await prisma.thanks.findMany({
            where: {
                title: {
                    contains: title,
                    mode: 'insensitive'
                }
            },
            take: 10,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json(thanks);
    } catch (error) {
        console.error("Search thanks error:", error);
        return res.status(500).json({ message: "Failed to search thanks" });
    }
};

export const getThanksPaginated = async (req: Request, res: Response) => {
    try {
        const { paginate, page = 1, limit = 9, search, sort = "newest" } = req.query;
        const where: Prisma.ThanksWhereInput = search ? {
            OR: [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ]
        } : {};

        const orderBy: Prisma.ThanksOrderByWithRelationInput =
            sort === 'oldest'
                ? { createdAt: 'asc' }
                : { createdAt: 'desc' };

        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        // 3. Fetch logic with Pagination + Total Count
        const [thanks, total] = await prisma.$transaction([
            prisma.thanks.findMany({
                where,
                // Only apply skip/take if paginate query param is 'true'
                ...(paginate === 'true' ? { take, skip } : {}),
                orderBy
            }),
            prisma.thanks.count({ where })
        ]);

        return res.status(200).json({
            data: thanks,
            meta: {
                totalItems: total,
                totalPages: Math.ceil(total / take),
                currentPage: Number(page),
                pageSize: take
            }
        });

    } catch (error) {
        console.error("Error fetching Thanks:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getFeaturedThanks = async (req: Request, res: Response) => {
    try {
        const { paginate, page = 1, limit = 3 } = req.query;
        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        // Use a consistent 'where' object
        const where: Prisma.ThanksWhereInput = { isFeatured: true };

        const [thanks, total] = await prisma.$transaction([
            prisma.thanks.findMany({
                where,
                ...(paginate === 'true' ? { take, skip } : {}),
                orderBy: { createdAt: 'desc' } // Usually featured blogs should be newest first
            }),
            prisma.thanks.count({ where })
        ]);

        return res.status(200).json({
            data: thanks, // Now this is just the array of blogs
            meta: {
                totalItems: total,
                totalPages: Math.ceil(total / take),
                currentPage: Number(page),
                pageSize: take
            }
        });
    } catch (error) {
        console.error("Error fetching featured thanks:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}