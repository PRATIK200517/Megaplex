import { Router } from 'express';
import {  deleteThanks, getFeaturedThanks, getThanks, getThanksbyId, getThanksPaginated, searchThanks, uploadThanks } from '../controllers/thanksController';
import { protect } from '../middlewears/authMiddlewears';

const thanksRouter=Router();

thanksRouter.post("/addThanks",protect,uploadThanks)

thanksRouter.post("/deleteThanks/:id",protect,deleteThanks);

thanksRouter.get("/search",protect,searchThanks);

thanksRouter.get("/thanks",getThanks)

thanksRouter.get("/fetchThanks",getThanksPaginated) ;//pagination version of getblogs with search and sort

thanksRouter.get("/fetchFeatured",getFeaturedThanks);

thanksRouter.get("/:thanksId",getThanksbyId)



export default thanksRouter;