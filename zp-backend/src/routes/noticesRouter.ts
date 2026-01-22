import  Router from 'express';
import {  deleteNotice, getNotices, uploadNotice } from '../controllers/noticeController';
import { protect } from '../middlewears/authMiddlewears'

const noticeRouter=Router();

noticeRouter.post("/addNotice",protect,uploadNotice);

noticeRouter.post("/deleteNotice/:id",protect,deleteNotice)

noticeRouter.get("/getNotices",getNotices);

export default noticeRouter;