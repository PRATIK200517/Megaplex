"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogbyId = exports.getBlogs = exports.deleteBlog = exports.uploadBlog = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const imageKit_1 = __importDefault(require("../lib/imageKit"));
const uploadBlog = async (req, res) => {
    try {
        const { title, description, content, images, isFeatured } = req.body;
        if (!title || !description || !content || !images || typeof isFeatured === 'undefined') {
            return res.status(400).json({ message: "Missing required fields: title, description, content, images, or isFeatured." });
        }
        const blog = await prisma_1.default.blog.create({
            data: {
                title: title,
                description: description,
                content: content,
                images: images,
                isFeatured: isFeatured
            }
        });
        if (blog) {
            return res.status(201).json({ message: "Blog uploaded successfully!", blogId: blog.id });
        }
        else {
            return res.status(500).json({ message: "Database error while uploading blog." });
        }
    }
    catch (error) {
        console.error("Upload Blog Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during blog upload." });
    }
};
exports.uploadBlog = uploadBlog;
const deleteBlog = async (req, res) => {
    try {
        const { blogId } = req.body;
        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required for deletion." });
        }
        const blogIdNumber = parseInt(blogId);
        const ImagesInBlog = await prisma_1.default.blog.findUnique({
            where: { id: blogIdNumber },
            select: { images: true }
        });
        if (!ImagesInBlog) {
            return res.status(404).json({ message: `Blog with ID ${blogId} not found.` });
        }
        if (ImagesInBlog.images) {
            const jsonValues = ImagesInBlog.images;
            const imageArray = jsonValues;
            if (Array.isArray(imageArray)) {
                const fileIds = imageArray.map(imageObject => imageObject.fileId);
                try {
                    await imageKit_1.default.bulkDeleteFiles(fileIds);
                }
                catch (ikError) {
                    console.error("ImageKit Cleanup Error:", ikError);
                }
            }
            else {
                console.error("The 'images' field is not a valid array for blog ID:", blogId);
                return res.status(500).json({ message: "Internal error: Image data structure is corrupted." });
            }
        }
        const deletedBlog = await prisma_1.default.blog.delete({
            where: { id: blogIdNumber }
        });
        if (deletedBlog) {
            return res.status(200).json({ message: "Blog deleted successfully" });
        }
    }
    catch (error) {
        console.error("Delete Blog Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during blog deletion." });
    }
};
exports.deleteBlog = deleteBlog;
const getBlogs = async (req, res) => {
    try {
        const blogs = await prisma_1.default.blog.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                images: true,
                isFeatured: true,
                createdAt: true,
            }
        });
        return res.status(200).json({
            blogs: blogs,
            message: "Blogs retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error retrieving blogs:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred while retrieving blogs."
        });
    }
};
exports.getBlogs = getBlogs;
const getBlogbyId = async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required." });
        }
        const blogIdNumber = parseInt(blogId);
        const blog = await prisma_1.default.blog.findUnique({
            where: { id: blogIdNumber }
        });
        if (blog) {
            return res.status(200).json({
                blog: blog,
                message: "Blog retrieved successfully"
            });
        }
        else {
            return res.status(404).json({
                message: `Blog with ID ${blogId} not found.`
            });
        }
    }
    catch (error) {
        console.error("Error retrieving blog by ID:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred while retrieving the blog."
        });
    }
};
exports.getBlogbyId = getBlogbyId;
