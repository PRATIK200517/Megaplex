import express, { Request, Response } from "express"
import { z } from 'zod'
import prisma from "../lib/prisma";
import imagekit from "../lib/imageKit";
import { Prisma } from "@prisma/client";


export const uploadBlog = async (req: Request, res: Response) => {
    try {
        const { title, description, content, images, isFeatured } = req.body;

        if (!title || !description || !content || !images || typeof isFeatured === 'undefined') {
            return res.status(400).json({ message: "Missing required fields: title, description, content, images, or isFeatured." })
        }

        const blog = await prisma.blog.create({
            data: {
                title: title,
                description: description,
                content: content,
                images: images,
                isFeatured: isFeatured
            }
        })

        if (blog) {
            return res.status(201).json({ message: "Blog uploaded successfully!", blogId: blog.id });
        } else {
            return res.status(500).json({ message: "Database error while uploading blog." });
        }
    } catch (error) {
        console.error("Upload Blog Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during blog upload." });
    }
}

export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const { blogId } = req.body;

        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required for deletion." });
        }

        const blogIdNumber = parseInt(blogId);

        const ImagesInBlog = await prisma.blog.findUnique({
            where: { id: blogIdNumber },
            select: { images: true }
        })

        if (!ImagesInBlog) {
            return res.status(404).json({ message: `Blog with ID ${blogId} not found.` });
        }

        if (ImagesInBlog.images) {
            const jsonValues = ImagesInBlog.images;

            type ImageObject = { fileId: string;[key: string]: any };
            const imageArray = jsonValues as ImageObject[]

            if (Array.isArray(imageArray)) {
                const fileIds = imageArray.map(imageObject => imageObject.fileId);

                try {
                    await imagekit.bulkDeleteFiles(fileIds);
                } catch (ikError) {
                    console.error("ImageKit Cleanup Error:", ikError);
                }
            } else {
                console.error("The 'images' field is not a valid array for blog ID:", blogId);
                return res.status(500).json({ message: "Internal error: Image data structure is corrupted." });
            }
        }

        const deletedBlog = await prisma.blog.delete({
            where: { id: blogIdNumber }
        });

        if (deletedBlog) {
            return res.status(200).json({ message: "Blog deleted successfully" });
        }
    } catch (error) {
        console.error("Delete Blog Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during blog deletion." });
    }
}

export const getBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await prisma.blog.findMany({
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

    } catch (error) {
        console.error("Error retrieving blogs:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred while retrieving blogs."
        });
    }
}

export const getBlogsPaginated = async (req: Request, res: Response) => {
    try {
        const { paginate, page = 1, limit = 9, search, sort = "newest" } = req.query;
        const where: Prisma.BlogWhereInput = search ? {
            OR: [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ]
        } : {};

        const orderBy: Prisma.BlogOrderByWithRelationInput =
            sort === 'oldest'
                ? { createdAt: 'asc' }
                : { createdAt: 'desc' };

        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        // 3. Fetch logic with Pagination + Total Count
        const [Blogs, total] = await prisma.$transaction([
            prisma.blog.findMany({
                where,
                // Only apply skip/take if paginate query param is 'true'
                ...(paginate === 'true' ? { take, skip } : {}),
                orderBy
            }),
            prisma.blog.count({ where })
        ]);

        return res.status(200).json({
            data: Blogs,
            meta: {
                totalItems: total,
                totalPages: Math.ceil(total / take),
                currentPage: Number(page),
                pageSize: take
            }
        });

    } catch (error) {
        console.error("Error fetching folders:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getFeaturedBlogs = async (req: Request, res: Response) => {
    try {
        const { paginate, page = 1, limit = 3 } = req.query;
        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        // Use a consistent 'where' object
        const where: Prisma.BlogWhereInput = { isFeatured: true };

        const [blogs, total] = await prisma.$transaction([
            prisma.blog.findMany({
                where,
                ...(paginate === 'true' ? { take, skip } : {}),
                orderBy: { createdAt: 'desc' } // Usually featured blogs should be newest first
            }),
            prisma.blog.count({ where })
        ]);

        return res.status(200).json({
            data: blogs, // Now this is just the array of blogs
            meta: {
                totalItems: total,
                totalPages: Math.ceil(total / take),
                currentPage: Number(page),
                pageSize: take
            }
        });
    } catch (error) {
        console.error("Error fetching featured blogs:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getBlogbyId = async (req: Request, res: Response) => {
    try {
        const { blogId } = req.params;
        console.log(blogId);
        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required." });
        }

        const blogIdNumber = parseInt(blogId);

        const blog = await prisma.blog.findUnique({
            where: { id: blogIdNumber }
        })

        if (blog) {
            return res.status(200).json({
                blog: blog,
                message: "Blog retrieved successfully"
            });
        } else {
            return res.status(404).json({
                message: `Blog with ID ${blogId} not found.`
            });
        }
    } catch (error) {
        console.error("Error retrieving blog by ID:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred while retrieving the blog."
        });
    }
}

// In your backend routes
export const searchBlogs = async (req: Request, res: Response) => {
    try {
        const { title } = req.query;

        if (!title || typeof title !== 'string') {
            return res.status(400).json({
                message: "Title query parameter is required"
            });
        }

        const blogs = await prisma.blog.findMany({
            where: {
                title: {
                    contains: title,
                    mode: 'insensitive' // Case insensitive search
                }
            },
            take: 10, // Limit results
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json(blogs);
    } catch (error) {
        console.error("Search Blogs Error:", error);
        return res.status(500).json({
            message: "An unexpected server error occurred during blog search."
        });
    }
}