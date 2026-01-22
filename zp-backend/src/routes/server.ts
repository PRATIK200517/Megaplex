import express from 'express';
import PhotoGalleryRouter from './photoGalleryRoute';
import adminRouter from './adminRouter';
import blogRouter from './blogRouter';
import alumniRouter from './alumniRouter';
import imagekitRouter from './imageKItRouter';
import thanksRouter from './specialThanksRouter';
import noticeRouter from './noticesRouter';
import mediaRouter from './mediaRouter';

const routes=express.Router();

routes.use("/gallery",PhotoGalleryRouter);
routes.use("/admin",adminRouter);
routes.use("/blogs",blogRouter);
routes.use("/thanks",thanksRouter);
routes.use("/notices",noticeRouter);
routes.use("/news",mediaRouter);
routes.use(alumniRouter);
routes.use(imagekitRouter);


export default routes;