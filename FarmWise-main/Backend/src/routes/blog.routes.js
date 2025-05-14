import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    likeBlog,
    addComment,
    getComments
} from "../controllers/blog.controller.js";

const router = Router();

router.route("/").post(varifyJWT, upload.single("blogImage"), createBlog);
router.route("/").get(getAllBlogs);
router.route("/:id").get(getBlogById);
router.route("/:id").patch(varifyJWT, upload.single("blogImage"), updateBlog);
router.route("/:id").delete(varifyJWT, deleteBlog);
router.route("/:id/like").patch(varifyJWT, likeBlog);
router.route("/:id/comment").post(varifyJWT, addComment);
router.route("/:id/comments").get(getComments);
export default router;
