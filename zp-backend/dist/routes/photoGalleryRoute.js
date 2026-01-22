"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const photoGalleryController_1 = require("../controllers/photoGalleryController");
const authMiddlewears_1 = require("../middlewears/authMiddlewears");
const PhotoGalleryRouter = (0, express_1.Router)();
PhotoGalleryRouter.get("/", () => {
    console.log("hello from gallery");
});
PhotoGalleryRouter.post("/addFolder", authMiddlewears_1.protect, photoGalleryController_1.addFolder);
PhotoGalleryRouter.post("/deleteFolder", authMiddlewears_1.protect, photoGalleryController_1.deleteFolder);
PhotoGalleryRouter.post("/addImages", authMiddlewears_1.protect, photoGalleryController_1.addImages);
PhotoGalleryRouter.post("/deleteImages", authMiddlewears_1.protect, photoGalleryController_1.deleteImages);
PhotoGalleryRouter.get("/getFolders", photoGalleryController_1.getFolders);
PhotoGalleryRouter.get("/:folderId/getImages", photoGalleryController_1.getImages);
PhotoGalleryRouter.get("/:folderId/:imageId");
exports.default = PhotoGalleryRouter;
