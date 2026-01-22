import { Router} from "express";
import { deleteBlog, getBlogbyId, getBlogs, uploadBlog, searchBlogs, getBlogsPaginated, getFeaturedBlogs } from "../controllers/blogController";
import { protect } from "../middlewears/authMiddlewears";

const blogRouter=Router();

blogRouter.post("/uploadBlog",protect,uploadBlog);

blogRouter.post("/deleteBlog",protect,deleteBlog);

blogRouter.get("/fetchBlog",getBlogs);

blogRouter.get("/fetchBlogs",getBlogsPaginated) //pagination version of getblogs with search and sort

blogRouter.get("/fetchFeatured",getFeaturedBlogs)

blogRouter.get("/fetchBlog/:blogId",getBlogbyId);

blogRouter.get('/search', searchBlogs);

export default blogRouter;