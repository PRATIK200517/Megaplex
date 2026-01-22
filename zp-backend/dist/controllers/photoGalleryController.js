"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImage = exports.getImages = exports.getFolders = exports.deleteImages = exports.addImages = exports.deleteFolder = exports.addFolder = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const imageKit_1 = __importDefault(require("../lib/imageKit"));
const folderInput = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    caption: zod_1.z.string().min(1, "Caption is required"),
    event_date: zod_1.z.coerce.date(),
    thumbnail_image: zod_1.z.object({
        fileId: zod_1.z.string(),
        url: zod_1.z.string(),
        height: zod_1.z.number().optional(),
        width: zod_1.z.number().optional()
    })
});
const addImagesInput = zod_1.z.object({
    folder_id: zod_1.z.number(),
    imageArray: zod_1.z.array(zod_1.z.object({
        fileId: zod_1.z.string(),
        url: zod_1.z.string(),
        height: zod_1.z.number().optional(),
        width: zod_1.z.number().optional()
    })).min(1, "At least one image is required")
});
const addFolder = async (req, res) => {
    try {
        const validation = folderInput.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }
        const { title, caption, thumbnail_image, event_date } = validation.data;
        const folder = await prisma_1.default.folders.create({
            data: {
                title: title,
                slug: caption,
                thumbnail_image: thumbnail_image,
                event_date: event_date
            }
        });
        if (!folder) {
            return res.status(400).json({ message: "Error in folder creation!" });
        }
        const galleryImage = await prisma_1.default.gallery_images.create({
            data: {
                folder_id: folder.id,
                fileId: thumbnail_image.fileId,
                url: thumbnail_image.url,
                height: thumbnail_image.height || 0,
                width: thumbnail_image.width || 0
            }
        });
        return res.status(201).json({
            message: "Folder and thumbnail created successfully",
            folder,
            galleryImage
        });
    }
    catch (error) {
        console.error("Add Folder Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.addFolder = addFolder;
const deleteFolder = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "ID field is required" });
        }
        const folderId = Number(id);
        const imagesInFolder = await prisma_1.default.gallery_images.findMany({
            where: { folder_id: folderId },
            select: { fileId: true }
        });
        if (imagesInFolder.length > 0) {
            const fileIdsToDelete = imagesInFolder.map(img => img.fileId);
            try {
                await imageKit_1.default.bulkDeleteFiles(fileIdsToDelete);
            }
            catch (ikError) {
                console.error("ImageKit Cleanup Error (Folder Delete):", ikError);
            }
        }
        await prisma_1.default.gallery_images.deleteMany({
            where: { folder_id: folderId }
        });
        const deletedFolder = await prisma_1.default.folders.delete({
            where: { id: folderId }
        });
        if (deletedFolder) {
            return res.status(200).json({ message: "Folder and associated images deleted successfully" });
        }
        else {
            return res.status(400).json({ message: "Error in folder deletion" });
        }
    }
    catch (error) {
        console.error("Delete Folder Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.deleteFolder = deleteFolder;
const addImages = async (req, res) => {
    try {
        const validation = addImagesInput.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }
        const { folder_id, imageArray } = validation.data;
        const imagesData = imageArray.map(img => ({
            folder_id: folder_id,
            fileId: img.fileId,
            url: img.url,
            height: img.height || 0,
            width: img.width || 0
        }));
        const createdImages = await prisma_1.default.gallery_images.createMany({
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
exports.addImages = addImages;
const deleteImages = async (req, res) => {
    try {
        const { fileIds } = req.body;
        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({ message: "No images selected for deletion" });
        }
        try {
            await imageKit_1.default.bulkDeleteFiles(fileIds);
        }
        catch (ikError) {
            console.error("ImageKit Deletion Error:", ikError);
        }
        const deletedRecord = await prisma_1.default.gallery_images.deleteMany({
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
            return res.status(404).json({ message: "No records found in database to delete" });
        }
    }
    catch (error) {
        console.error("Delete Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.deleteImages = deleteImages;
const getFolders = async (req, res) => {
    try {
        const folders = await prisma_1.default.folders.findMany();
        return res.status(200).json({
            message: "Folders fetched successfully",
            folders: folders
        });
    }
    catch (error) {
        console.error("Get Folders Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getFolders = getFolders;
const getImages = async (req, res) => {
    const folderIdParam = req.params.folderId;
    const folder_id = Number(folderIdParam);
    if (isNaN(folder_id) || folder_id <= 0) {
        return res.status(400).json({ message: "Invalid folder ID provided" });
    }
    try {
        const images = await prisma_1.default.gallery_images.findMany({
            where: {
                folder_id: folder_id
            },
            orderBy: {
                id: 'asc'
            }
        });
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
exports.getImages = getImages;
const getImage = async (req, res) => {
    try {
        const { folderId, imageId } = req.params;
        const Id = parseInt(imageId);
        if (!folderId || !imageId) {
            return res.status(400).json({ message: "folder id and image id are missing" });
        }
        const image = await prisma_1.default.gallery_images.findFirst({
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
            return res.status(400).json({
                image: image,
                message: "No image found with this Id"
            });
        }
    }
    catch (error) {
        console.error("Get Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getImage = getImage;
