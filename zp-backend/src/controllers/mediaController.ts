import { z } from "zod";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import imagekit from "../lib/imageKit";

// --- VALIDATION SCHEMAS ---

const ImageSchema = z.object({
    // Added titile to match your @unique requirement in schema
    title: z.string().nonempty("Title is required."), 
    fileId: z.string().nonempty("File ID cannot be empty."),
    url: z.string().url("URL must be a valid URL."),
    height: z.number().int().optional().default(0),
    width: z.number().int().optional().default(0),
});

const AddMediaSchema = z.object({
    imageArray: z.array(ImageSchema).nonempty("Image array cannot be empty."),
});

const DeleteMediaSchema = z.object({
    fileIds: z.array(z.string().nonempty("File ID cannot be empty.")).nonempty("File IDs array cannot be empty."),
});

type ImageType = z.infer<typeof ImageSchema>;
type AddMediaRequestBody = z.infer<typeof AddMediaSchema>;
type DeleteMediaRequestBody = z.infer<typeof DeleteMediaSchema>;

// --- CONTROLLERS ---

/**
 * @desc Add multiple images to the press_images table
 */
export const addMedia = async (req: Request<{}, {}, AddMediaRequestBody>, res: Response) => {
    try {
        const validationResult = AddMediaSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ 
                message: "Invalid request body format", 
                errors: validationResult.error.format() 
            });
        }
        
        const { imageArray } = validationResult.data;

        const imagesData = imageArray.map((img: ImageType) => ({
            title: img.title, 
            fileId: img.fileId,
            url: img.url,
            height: img.height, 
            width: img.width,
        }));

        const createdImages = await prisma.press_images.createMany({
            data: imagesData,
            skipDuplicates: true // Prevents 500 errors if a unique titile/fileId already exists
        });

        return res.status(201).json({ 
            message: "Images uploaded and saved successfully", 
            count: createdImages.count 
        });

    } catch (error) {
        console.error("Add Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc Delete images from ImageKit and the database
 */
export const deleteMedia = async (req: Request<{}, {}, DeleteMediaRequestBody>, res: Response) => {
    try {
        const validationResult = DeleteMediaSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ 
                message: "Invalid request body format", 
                errors: validationResult.error.format() 
            });
        }

        const { fileIds } = validationResult.data;

        // 1. Delete from ImageKit Cloud Storage
        try {
            await imagekit.bulkDeleteFiles(fileIds);
        } catch (ikError) {
            // Log cloud error but continue to DB deletion to keep local data clean
            console.error("ImageKit Cloud Deletion Warning:", ikError);
        }

        // 2. Delete from Prisma Database
        const deletedRecord = await prisma.press_images.deleteMany({
            where: {
                fileId: {
                    in: fileIds
                }
            }
        });

        if (deletedRecord.count > 0) {
            return res.status(200).json({ 
                message: "Images deleted successfully from database", 
                count: deletedRecord.count 
            });
        } else {
            return res.status(404).json({ 
                message: "No matching records found in database to delete." 
            });
        }

    } catch (error) {
        console.error("Delete Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc Get all press images
 */
export const getMediaImages = async (req: Request, res: Response) => {
    try {
        const images = await prisma.press_images.findMany({
            orderBy: { uploaded_at: 'desc' }
        });

        return res.status(200).json({
            message: images.length > 0 ? "Images fetched successfully" : "No images found",
            images: images
        });
        
    } catch (error) {
        console.error("Get Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * @desc Get a single image by its primary ID
 */
export const getMediaImage = async (req: Request<{imageId: string}>, res: Response) => {
    try {
        const { imageId } = req.params;
        const Id = parseInt(imageId);
        
        if (isNaN(Id)) {
             return res.status(400).json({ message: "Image ID must be a valid number" });
        }

        const image = await prisma.press_images.findUnique({
            where: { id: Id }
        });

        if (image) {
            return res.status(200).json({
                image: image,
                message: "Image retrieved successfully"
            });
        } else {
            return res.status(404).json({
                image: null,
                message: "No image found with this ID"
            });
        }
    } catch (error) {
        console.error("Get Image Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}