import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaThumbsUp, FaUser, FaComments, FaShare, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';

const BlogDetail = ({ blog, onClose, onLike, onDelete }) => {
  const { user } = useSelector((state) => state.auth);
  const { accessToken } = useSelector((state) => state.auth);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(blog.comments || []);
  const [fullBlog, setFullBlog] = useState(blog);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(blog.content);

  useEffect(() => {
    const fetchFullBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api/farmwise/blog/${blog._id}`, {
          withCredentials: true,
        });
        setFullBlog(response.data.data);
        setComments(response.data.data.comments || []);
      } catch (error) {
        console.error('Failed to fetch blog details:', error);
      }
    };

    fetchFullBlog();
  }, [blog._id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:9000/api/farmwise/blog/${blog._id}/comment`,
        { comment: newComment },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      // Update the fullBlog state with the complete response data
      setFullBlog(response.data.data);
      setComments(response.data.data.comments);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`http://localhost:9000/api/farmwise/blog/${blog._id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        onDelete(blog._id);
        onClose();
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:9000/api/farmwise/blog/${blog._id}`,
        { content: editedContent },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      setFullBlog(response.data.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update blog:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
    >
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <FaUser className="text-green-600 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">{fullBlog.author.username}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(fullBlog.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user && user._id === fullBlog.author._id && (
                <>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <FaEdit className="text-xl" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <FaTrash className="text-xl" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
          </div>

          {fullBlog.blogPicture && (
            <img
              src={fullBlog.blogPicture.url}
              alt={fullBlog.title}
              className="w-full h-96 object-cover rounded-xl mb-6"
            />
          )}

          <h1 className="text-3xl font-bold mb-4">{fullBlog.title}</h1>

          <div className="flex flex-wrap gap-3 mb-6">
            {fullBlog.tags && fullBlog.tags.map((tag, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-white border border-green-200 rounded-md shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300"
              >
                <span className="text-green-700 text-sm">{tag}</span>
              </div>
            ))}
          </div>

          {isEditing ? (
            <div className="mb-6">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="10"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: fullBlog.content }}
            />
          )}

          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => onLike(fullBlog._id)}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
            >
              <FaThumbsUp className={fullBlog.likes?.includes(user?._id) ? "text-green-600" : ""} />
              <span>{fullBlog.likes?.length || 0} Likes</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-600">
              <FaComments />
              <span>{fullBlog.comments?.length || 0} Comments</span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            <div className="space-y-4 mb-6">
              {comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaUser className="text-green-600" />
                    <span className="font-semibold">
                      {comment.user?.username || 'Anonymous User'}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {user && (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogDetail; 