import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaThumbsUp, FaUser, FaSearch, FaHotjar, FaTrophy, FaClock, FaComments, FaShare, FaTimes, FaPlus } from "react-icons/fa";
import axios from 'axios';
import { useSelector } from 'react-redux';
import CreateBlogModal from "../components/CreateBlogModal";
import BlogDetail from "../components/BlogDetail";

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("trending");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { accessToken } = useSelector((state) => state.auth);

  // Debug logging
  useEffect(() => {
    console.log("Current user in BlogPage:", user);
  }, [user]);

  const isVerifiedExpert = user?.userType === 'expert' && user?.verified === true;

  // Debug logging for verification status
  useEffect(() => {
    console.log("isVerifiedExpert:", isVerifiedExpert);
    console.log("User type:", user?.userType);
    console.log("Verified status:", user?.verified);
  }, [user, isVerifiedExpert]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/farmwise/blog', {
        withCredentials: true,
      });
      console.log('API Response:', response);
      if (Array.isArray(response.data.data)) {
        const validBlogs = response.data.data.map(blog => ({
          ...blog,
          likes: blog.likes || [],
          comments: blog.comments || [],
          tags: blog.tags || [],
          author: blog.author || { username: 'Unknown', _id: '' },
          title: blog.title || 'Untitled',
          _id: blog._id || '',
          createdAt: blog.createdAt || new Date().toISOString()
        }));
        setBlogs(validBlogs);
      } else {
        console.error('Invalid blog data format received');
        setBlogs([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      setBlogs([]);
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    try {
      const response = await axios.patch(`http://localhost:9000/api/farmwise/blog/${blogId}/like`, { accessToken }, {
        withCredentials: true
      });
      const updatedBlog = response.data.data;
      setBlogs(blogs.map(blog =>
        blog._id === updatedBlog._id ? updatedBlog : blog
      ));
      if (selectedPost?._id === blogId) {
        setSelectedPost(updatedBlog);
      }
    } catch (error) {
      console.error('Failed to like blog:', error);
    }
  };

  const handleBlogCreated = (newBlog) => {
    setBlogs([newBlog, ...blogs]);
  };

  const handleBlogSelect = async (blog) => {
    try {
      const response = await axios.get(`http://localhost:9000/api/farmwise/blog/${blog._id}`, {
        withCredentials: true,
      });
      setSelectedPost(response.data.data);
    } catch (error) {
      console.error('Failed to fetch blog details:', error);
    }
  };

  const handleBlogDeleted = (deletedBlogId) => {
    setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== deletedBlogId));
    setSelectedPost(null);
  };

  const filteredPosts = blogs.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <motion.aside
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full md:w-1/4"
          >
            <div className="bg-white p-4 rounded-2xl shadow-md sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>
              <ul className="space-y-2">
                {[
                  { icon: <FaHotjar />, label: "Trending", value: "trending" },
                  { icon: <FaTrophy />, label: "Most Liked", value: "liked" },
                  { icon: <FaClock />, label: "Recent Posts", value: "recent" }
                ].map((filter) => (
                  <motion.li
                    key={filter.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${activeFilter === filter.value
                      ? 'bg-green-100 text-green-600'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.aside>

          <motion.main
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full md:w-2/4"
          >
            {isVerifiedExpert && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mb-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus /> Create New Blog
              </motion.button>
            )}

            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search for blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8">No blogs found</div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post._id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer"
                    onClick={() => handleBlogSelect(post)}
                  >
                    {post.blogPicture && (
                      <img
                        src={post.blogPicture.url}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <FaUser className="text-green-500" />
                        <span>{post.author.username}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-gray-500">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post._id);
                            }}
                            className="flex items-center space-x-2"
                          >
                            <FaThumbsUp className={post?.likes?.includes(user?._id) ? "text-green-500" : ""} />
                            <span>{post?.likes?.length || 0}</span>
                          </button>
                          <div className="flex items-center space-x-2">
                            <FaComments />
                            <span>{post?.comments?.length || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {post.tags.map((tag, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 bg-white border border-green-200 rounded-lg shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300"
                            >
                              <span className="text-green-700 font-medium">{tag}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.main>

          <motion.aside
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full md:w-1/4"
          >
            <div className="bg-white p-4 rounded-2xl shadow-md sticky top-24">
              {selectedPost ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-green-600 text-3xl" />
                      <div>
                        <h3 className="text-lg font-semibold">{selectedPost.author.username}</h3>
                        <p className="text-green-600">Organic Farming Expert</p>
                        <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                          <span>{blogs.filter(blog => blog.author._id === selectedPost.author._id).length} posts</span>
                          <span>•</span>
                          <span>100k total likes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-700">Other posts by {selectedPost.author.username}</h4>
                  <div className="space-y-3">
                    {blogs.filter(blog => blog.author._id === selectedPost.author._id).map(post => (
                      <div key={post._id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <h5 className="font-medium text-gray-800">{post.title}</h5>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-1">
                            <FaThumbsUp className="text-xs" />
                            <span>{post.likes?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Select a post to see author details</p>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateBlogModal
            onClose={() => setShowCreateModal(false)}
            onBlogCreated={handleBlogCreated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <BlogDetail
            blog={selectedPost}
            onClose={() => setSelectedPost(null)}
            onLike={handleLike}
            onDelete={handleBlogDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blog;
