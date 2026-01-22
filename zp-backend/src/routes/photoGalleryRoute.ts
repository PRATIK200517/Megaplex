import express, { Router } from 'express';
import { addFolder, addImages, deleteFolder, deleteImages, getFolderById, getFolderNames, getFolders, getImage, getImages, getImagesByFolder } from '../controllers/photoGalleryController';
import { protect } from '../middlewears/authMiddlewears';

const PhotoGalleryRouter=Router();


PhotoGalleryRouter.get("/",()=>{
    console.log("hello from gallery");
})

PhotoGalleryRouter.post("/addFolder",protect,addFolder);

PhotoGalleryRouter.delete("/deleteFolder/:id",protect,deleteFolder);

PhotoGalleryRouter.post("/addImages",protect,addImages);

PhotoGalleryRouter.post("/deleteImages",protect,deleteImages);

PhotoGalleryRouter.get("/getFolders",getFolders);

PhotoGalleryRouter.get("/:folderId/getImages",getImages)

PhotoGalleryRouter.get("/getFolderNames",getFolderNames)

PhotoGalleryRouter.get("/folderId")

PhotoGalleryRouter.get("/folders/:folderId", getFolderById);

// 2. Get the paginated images inside that folder
PhotoGalleryRouter.get("/:folderId/images", getImagesByFolder);

// 3. (Optional) Get a single specific image
PhotoGalleryRouter.get("/:folderId/images/:imageId", getImage);

export default PhotoGalleryRouter;