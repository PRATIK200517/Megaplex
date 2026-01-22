import { Router } from 'express';
import { addMedia, deleteMedia, getMediaImage, getMediaImages } from '../controllers/mediaController';
import { protect } from '../middlewears/authMiddlewears';

const mediaRouter=Router();


mediaRouter.get("/",()=>{
    console.log("hello from media");
})


mediaRouter.post("/addMedia",protect,addMedia);

mediaRouter.post("/deleteMedia",protect,deleteMedia);

mediaRouter.get("/media",getMediaImages)

mediaRouter.get("/media/:id",getMediaImage)

export default mediaRouter;