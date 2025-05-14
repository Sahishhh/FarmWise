import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Blog } from "../models/blog.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createBlog = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;
    console.log(req.body);
    const userId = req.user.id;

    let blogPicture = null;

    if (req.file) {
        const uploadedImage = await uploadOnCloudinary(req.file.path);
        blogPicture = {
            public_id: uploadedImage.public_id,
            url: uploadedImage.secure_url
        };
    }

    // Parse tags if they are sent as a JSON string
    let parsedTags = tags;
    if (typeof tags === 'string') {
        try {
            parsedTags = JSON.parse(tags);
        } catch (error) {
            parsedTags = tags.split(',').map(tag => tag.trim());
        }
    }

    const blog = await Blog.create({
        title,
        content,
        author: userId,
        tags: parsedTags,
        blogPicture
    });

    return res.status(201).json(new ApiResponse(201, blog, "Blog created successfully"));
});

export const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find()
        .populate('author', 'username profilePic')
        .populate('likes', 'username')
        .populate({
            path: 'comments.user',
            select: 'username profilePic'
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, blogs, "All blogs retrieved"));
});

export const getBlogById = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
        .populate('author', 'username profilePic')
        .populate({
            path: 'comments.user',
            select: 'username profilePic'
        });

    if (!blog) throw new ApiError(404, "Blog not found");

    return res.status(200).json(new ApiResponse(200, blog, "Blog retrieved successfully"));
});

export const updateBlog = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) throw new ApiError(404, "Blog not found");

    if (req.file) {
        const uploadedImage = await uploadOnCloudinary(req.file.path);
        blog.blogPicture = {
            public_id: uploadedImage.public_id,
            url: uploadedImage.secure_url
        };
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;
    blog.updatedAt = new Date();

    await blog.save();

    return res.status(200).json(new ApiResponse(200, blog, "Blog updated successfully"));
});

export const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) throw new ApiError(404, "Blog not found");

    return res.status(200).json(new ApiResponse(200, {}, "Blog deleted successfully"));
});

export const likeBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) throw new ApiError(404, "Blog not found");

    const userId = req.user.id;

    if (blog.likes.includes(userId)) {
        blog.likes = blog.likes.filter(id => id.toString() !== userId);
        await blog.save();
        return res.status(200).json(new ApiResponse(200, blog, "Like removed"));
    } else {
        blog.likes.push(userId);
        await blog.save();
        return res.status(200).json(new ApiResponse(200, blog, "Blog liked"));
    }
});

export const addComment = asyncHandler(async (req, res) => {
    const { comment } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) throw new ApiError(404, "Blog not found");

    const newComment = {
        user: req.user.id,
        comment,
        createdAt: new Date()
    };

    blog.comments.push(newComment);
    await blog.save();

    // Fetch the updated blog with populated user data
    const updatedBlog = await Blog.findById(req.params.id)
        .populate('author', 'username profilePic')
        .populate({
            path: 'comments.user',
            select: 'username profilePic'
        });

    return res.status(200).json(new ApiResponse(200, updatedBlog, "Comment added successfully"));
});

export const getComments = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
        .populate({
            path: 'comments.user',
            select: 'name profilePic'
        });

    if (!blog) throw new ApiError(404, "Blog not found");

    return res.status(200).json(new ApiResponse(200, blog.comments, "Comments retrieved"));
});
