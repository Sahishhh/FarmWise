import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BlogEditor from './BlogEditor';
import axios from 'axios';
import { useSelector } from 'react-redux';

const CreateBlogModal = ({ onClose, onBlogCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    blogImage: null
  });
  const [preview, setPreview] = useState(null);
  const { accessToken } = useSelector((state) => state.auth);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, blogImage: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(tag => tag.trim()))); // Tags as JSON string
      if (formData.blogImage) {
        formDataToSend.append('blogImage', formData.blogImage);
      }

      const response = await axios.post(
        'http://localhost:9000/api/farmwise/blog',
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      onBlogCreated(response.data.data);
      onClose();
    } catch (error) {
      console.error('Failed to create blog:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Create New Blog</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Blog Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />

            <BlogEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />

            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded-lg"
              />
              {preview && (
                <img src={preview} alt="Preview" className="mt-2 max-h-40 rounded" />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Publish
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateBlogModal;
