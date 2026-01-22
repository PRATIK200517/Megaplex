import { z } from "zod";
import { Request, Response } from "express";
import prisma from "../lib/prisma"; 
import imagekit from "../lib/imageKit"; 
import {  Prisma } from '@prisma/client';

const folderInput = z.object({
    title: z.string().min(1, "Title is required"),
    caption: z.string().min(1, "Caption is required"),
    event_date: z.coerce.date(),
    thumbnail_image: z.object({
        fileId: z.string(),
        url: z.string(),
        height: z.number().optional(),
        width: z.number().optional()
    })
});

const addImagesInput = z.object({
    folder_id: z.number(),
    imageArray: z.array(z.object({
        fileId: z.string(),
        url: z.string(),
        height: z.number().optional(),
        width: z.number().optional()
    })).min(1, "At least one image is required")
});

export const addFolder = async (req: Request, res: Response) => {
    try {
        const validation = folderInput.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format() 
            });
        }

        const { title, caption, thumbnail_image, event_date } = validation.data;

        const folder = await prisma.folders.create({
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

        const galleryImage = await prisma.gallery_images.create({
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

    } catch (error) {
        console.error("Add Folder Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteFolder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "ID field is required" });
        }

        const folderId = Number(id);

        const imagesInFolder = await prisma.gallery_images.findMany({
            where: { folder_id: folderId },
            select: { fileId: true }
        });

        if (imagesInFolder.length > 0) {
            const fileIdsToDelete = imagesInFolder.map(img => img.fileId);
            try {
                await imagekit.bulkDeleteFiles(fileIdsToDelete);
            } catch (ikError) {
                console.error("ImageKit Cleanup Error (Folder Delete):", ikError);
            }
        }

        await prisma.gallery_images.deleteMany({
            where: { folder_id: folderId }
        });

        const deletedFolder = await prisma.folders.delete({
            where: { id: folderId }
        });

        if (deletedFolder) {
            return res.status(200).json({ message: "Folder and associated images deleted successfully" });
        } else {
            return res.status(400).json({ message: "Error in folder deletion" });
        }

    } catch (error) {
        console.error("Delete Folder Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addImages = async (req: Request, res: Response) => {
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

        const createdImages = await prisma.gallery_images.createMany({
            data: imagesData
        });

        if (createdImages) {
            return res.status(201).json({ 
                message: "Images uploaded and saved successfully", 
                count: createdImages.count 
            });
        } else {
            return res.status(400).json({ message: "Error while saving images" });
        }

    } catch (error) {
        console.error("Add Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteImages = async (req: Request, res: Response) => {
    try {
        const { fileIds } = req.body; 

        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).json({ message: "No images selected for deletion" });
        }

        try {
            await imagekit.bulkDeleteFiles(fileIds);
        } catch (ikError) {
            console.error("ImageKit Deletion Error:", ikError);
        }

        const deletedRecord = await prisma.gallery_images.deleteMany({
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
        } else {
            return res.status(404).json({ message: "No records found in database to delete" });
        }

    } catch (error) {
        console.error("Delete Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getFolderById = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.params;

    // 1. Convert folderId to integer
    const id = parseInt(folderId);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid Folder ID provided" });
    }

    // 2. Fetch the folder from database
    const folder = await prisma.folders.findUnique({
      where: { id: id },
    });

    // 3. Handle 404 Case
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // 4. Return folder data
    // Note: The frontend expects fields like 'event_date' and 'title'
    return res.status(200).json(folder);

  } catch (error) {
    console.error("Error fetching folder info:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getImagesByFolder = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.params;
    const { paginate, page = 1, limit = 12 } = req.query;

    const folder_Id = parseInt(folderId);
    if (!folder_Id) {
      return res.status(400).json({ message: "Folder ID is missing" });
    }

    const where: Prisma.gallery_imagesWhereInput = {
      folder_id: folder_Id
    };

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [images, total] = await prisma.$transaction([
      prisma.gallery_images.findMany({
        where,
        ...(paginate === 'true' ? { take, skip } : {}),
        orderBy: { id: 'desc' } // Defaulting to newest first
      }),
      prisma.gallery_images.count({ where })
    ]);

    // 4. Return structured response
    return res.status(200).json({
      data: images,
      meta: {
        totalItems: total,
        totalPages: Math.ceil(total / take),
        currentPage: Number(page),
        pageSize: take
      }
    });

  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getFolders = async (req: Request, res: Response) => {
  try {
    const { paginate, page = 1, limit = 12, search, sort = 'newest' } = req.query;

    // 1. Setup the search filter
    const where: Prisma.foldersWhereInput = search ? {
      OR: [
        { title: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } }
      ]
    } : {};

    // 2. Setup sort order based on query parameter (only newest/oldest)
    const orderBy: Prisma.foldersOrderByWithRelationInput = 
      sort === 'oldest' 
        ? { event_date: 'asc' }    // Oldest first
        : { event_date: 'desc' };   // Newest first (default)

    // Pagination calculations
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    // 3. Fetch logic with Pagination + Total Count
    const [folders, total] = await prisma.$transaction([
      prisma.folders.findMany({
        where,
        // Only apply skip/take if paginate query param is 'true'
        ...(paginate === 'true' ? { take, skip } : {}),
        orderBy
      }),
      prisma.folders.count({ where })
    ]);

    // 4. Manual Count of images per folder
    const folderIds = folders.map(f => f.id);
    const counts = await prisma.gallery_images.groupBy({
      by: ['folder_id'],
      where: { folder_id: { in: folderIds } },
      _count: { _all: true }
    });

    // 5. Merge counts into folder objects
    const foldersWithCounts = folders.map(folder => {
      const countObj = counts.find(c => c.folder_id === folder.id);
      return {
        ...folder,
        image_count: countObj?._count._all || 0
      };
    });

    // 6. Return structured response
    return res.status(200).json({
      data: foldersWithCounts,
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
};

export const getFolderNames = async (req: Request, res: Response) => {
    try {
        const folders = await prisma.folders.findMany({
            select:{
                id:true,
                title:true
            }
        });
        
        return res.status(200).json({ 
            message: "Folders fetched successfully", 
            folders: folders 
        });

    } catch (error) {
        console.error("Get Folders Error:", error); 
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getImages = async (req: Request, res: Response) => {
    const folderIdParam = req.params.folderId;
    const folder_id = Number(folderIdParam);

    if (isNaN(folder_id) || folder_id <= 0) {
        return res.status(400).json({ message: "Invalid folder ID provided" });
    }

    try {
        const images = await prisma.gallery_images.findMany({
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
        
    } catch (error) {
        console.error("Get Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export const getImage = async (req:Request,res:Response)=>{
    try{
        const {folderId,imageId}=req.params;

        const Id=parseInt(imageId);
        
        if(!folderId || !imageId){
            return res.status(400).json({ message: "folder id and image id are missing" });
        }

        const image = await prisma.gallery_images.findFirst({
            where:{
                id:Id
            }
        })

        if(image){
            return res.status(200).json({
                image:image,
                message:"Image retrieved successfully"
            });
        }else{
            return res.status(400).json({
                image:image,
                message:"No image found with this Id"
            });
        }
    }catch(error){
        console.error("Get Images Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

