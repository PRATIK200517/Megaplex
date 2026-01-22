"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMediaImage = exports.getMediaImages = exports.deleteMedia = exports.addMedia = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const imageKit_1 = __importDefault(require("../lib/imageKit"));
const ImageSchema = zod_1.z.object({
    fileId: zod_1.z.string().nonempty("File ID cannot be empty."),
    url: zod_1.z.string().url("URL must be a valid URL."),
    height: zod_1.z.number().int().optional().default(0),
    width: zod_1.z.number().int().optional().default(0),
});
const AddMediaSchema = zod_1.z.object({
    imageArray: zod_1.z.array(ImageSchema).nonempty("Image array cannot be empty."),
});
const DeleteMediaSchema = zod_1.z.object({
    fileIds: zod_1.z.array(zod_1.z.string().nonempty("File ID cannot be empty.")).nonempty("File IDs array cannot be empty."),
});
const addMedia = async (req, res) => {
    try {
        // Use Zod for validation before proceeding
        const validationResult = AddMediaSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Invalid request body format",
                errors: validationResult.error.format()
            });
        }
        const { imageArray } = validationResult.data;
        // FIX: Explicitly type the 'img' parameter using ImageType
        const imagesData = imageArray.map((img) => ({
            fileId: img.fileId,
            url: img.url,
            // Use the validated height/width, which defaults to 0 if not provided
            height: img.height,
            width: img.width,
        }));
        const createdImages = await prisma_1.default.press_images.createMany({
            data: imagesData
        });
        if (createdImages) {
            return res.status(201).json({
                message: "Images uploaded and saved successfully",
                count: createdImages.count
            });
        }
        else {
            return res.status(400).json({ message: "Error while saving images" });
        }
    }
    catch (error) {
        console.error("Add Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.addMedia = addMedia;
const deleteMedia = async (req, res) => {
    try {
        const validationResult = DeleteMediaSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Invalid request body format",
                errors: validationResult.error.format()
            });
        }
        const { fileIds } = validationResult.data;
        try {
            await imageKit_1.default.bulkDeleteFiles(fileIds);
        }
        catch (ikError) {
            console.error("ImageKit Deletion Error:", ikError);
            // Optionally decide whether to stop here or continue deleting DB record
            // We continue to ensure DB cleanup if IK fails
        }
        // FIX: Changed from prisma.gallery_images to prisma.press_images
        const deletedRecord = await prisma_1.default.press_images.deleteMany({
            where: {
                fileId: {
                    in: fileIds
                }
            }
        });
        if (deletedRecord.count > 0) {
            return res.status(200).json({
                message: "Images deleted successfully",
                count: deletedRecord.count
            });
        }
        else {
            // Note: If ImageKit deletion succeeded but no DB records were found, 
            // the operation is still partially successful, 200 is fine.
            return res.status(200).json({ message: "ImageKit files deleted, but no matching records found in database." });
        }
    }
    catch (error) {
        console.error("Delete Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.deleteMedia = deleteMedia;
const getMediaImages = async (req, res) => {
    try {
        const images = await prisma_1.default.press_images.findMany();
        return res.status(200).json({
            message: images.length > 0 ? "Images fetched successfully" : "No images found for this folder",
            images: images
        });
    }
    catch (error) {
        console.error("Get Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getMediaImages = getMediaImages;
const getMediaImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        // Ensure imageId is a number
        const Id = parseInt(imageId);
        if (isNaN(Id)) {
            return res.status(400).json({ message: "Image ID must be a valid number" });
        }
        // FIX: Changed from prisma.gallery_images to prisma.press_images
        const image = await prisma_1.default.press_images.findFirst({
            where: {
                id: Id
            }
        });
        if (image) {
            return res.status(200).json({
                image: image,
                message: "Image retrieved successfully"
            });
        }
        else {
            return res.status(404).json({
                image: null,
                message: "No image found with this Id"
            });
        }
    }
    catch (error) {
        console.error("Get Image Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getMediaImage = getMediaImage;
