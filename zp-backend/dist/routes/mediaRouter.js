"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediaController_1 = require("../controllers/mediaController");
const authMiddlewears_1 = require("../middlewears/authMiddlewears");
const mediaRouter = (0, express_1.Router)();
mediaRouter.get("/", () => {
    console.log("hello from media");
});
mediaRouter.post("/addMedia", authMiddlewears_1.protect, mediaController_1.addMedia);
mediaRouter.post("/deleteMedia", authMiddlewears_1.protect, mediaController_1.deleteMedia);
mediaRouter.get("/media", mediaController_1.getMediaImages);
mediaRouter.get("/media/:id", mediaController_1.getMediaImage);
exports.default = mediaRouter;
