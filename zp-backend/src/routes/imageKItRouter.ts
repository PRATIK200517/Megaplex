import express from 'express';
import { getUploadAuth } from '../controllers/imagekitController';
import { protect } from '../middlewears/authMiddlewears';

const imagekitRouter = express.Router();

imagekitRouter.get('/upload-auth',  getUploadAuth);

export default imagekitRouter;