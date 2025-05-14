import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaUser, FaPaperPlane, FaSearch, FaFilter, FaThumbsUp, FaReply, FaTrash, FaTags, FaSortAmountDown, FaExclamationCircle, FaTimes, FaComments, FaArrowRight } from 'react-icons/fa';
import io from 'socket.io-client';

const DiscussionPage = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionTags, setNewQuestionTags] = useState([]);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedDiscussion, setExpandedDiscussion] = useState(null);
  const [error, setError] = useState(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeoutRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageTimeoutRef = useRef(null);

  const tags = ['All', 'Crop Management', 'Soil Health', 'Pest Control', 'Organic Farming', 'Irrigation', 'Market Prices'];
  const discussionEndRef = useRef(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [selectedSort]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://localhost:9000/api/farmwise/discussions?sort=${selectedSort}`, {
        withCredentials: true
      });
      setDiscussions(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
      setError('Failed to load discussions. Please try again later.');
      setLoading(false);
    }
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      const response = await axios.post('http://localhost:9000/api/farmwise/discussions', {
        content: newQuestion,
        tags: newQuestionTags.length > 0 ? newQuestionTags : ['General']
      }, {
        withCredentials: true
      });

      setDiscussions([response.data.data, ...discussions]);
      setNewQuestion('');
      setNewQuestionTags([]);
      setShowNewQuestionForm(false);
      // Scroll to the new discussion
      discussionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to post question:', error);
      setError('Failed to post question. Please try again.');
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:9000', {
      auth: {
        userId: user._id,
        token: accessToken
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('receiveMessage', (message) => {
      setDiscussions(prevDiscussions => 
        prevDiscussions.map(disc =>
          disc._id === message.threadId
            ? {
                ...disc,
                replies: [...(disc.replies || []), message]
              }
            : disc
        )
      );
    });

    newSocket.on('messageSent', ({ success, messageId }) => {
      if (success) {
        setReplyContent('');
        setReplyingTo(null);
      }
    });

    newSocket.on('messageError', (error) => {
      setError(error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, accessToken]);

  // Clear message timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const handlePostReply = useCallback(async (discussionId) => {
    if (!replyContent.trim() || !isConnected || !socket) return;

    // Prevent duplicate submissions
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    try {
      setIsSubmitting(true);

      // Emit the message through socket
      socket.emit('sendMessage', {
        message: replyContent,
        threadId: discussionId
      });

      // Set a timeout to clear the form if no response is received
      messageTimeoutRef.current = setTimeout(() => {
        setReplyContent('');
        setReplyingTo(null);
        setIsSubmitting(false);
      }, 5000);

    } catch (error) {
      console.error('Failed to post reply:', error);
      setError('Failed to post reply. Please try again.');
      setIsSubmitting(false);
    }
  }, [replyContent, isConnected, socket]);

  const handleLike = async (discussionId) => {
    if (!user) {
      setError('Please log in to like discussions');
      return;
    }

    try {
      const response = await axios.patch(`http://localhost:9000/api/farmwise/discussions/${discussionId}/like`, {}, {
        withCredentials: true
      });

      // Update the discussion likes
      setDiscussions(discussions.map(disc =>
        disc._id === discussionId ? response.data.data : disc
      ));
    } catch (error) {
      console.error('Failed to like discussion:', error);
      setError('Failed to like the discussion. Please try again.');
    }
  };

  const handleTagSelection = (tag) => {
    if (newQuestionTags.includes(tag)) {
      setNewQuestionTags(newQuestionTags.filter(t => t !== tag));
    } else {
      setNewQuestionTags([...newQuestionTags, tag]);
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (window.confirm('Are you sure you want to delete this discussion?')) {
      try {
        await axios.delete(`http://localhost:9000/api/farmwise/discussions/${discussionId}`, {
          withCredentials: true
        });
        setDiscussions(discussions.filter(disc => disc._id !== discussionId));
      } catch (error) {
        console.error('Failed to delete discussion:', error);
        setError('Failed to delete the discussion. Please try again.');
      }
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.author.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = selectedTag === 'All' ||
      discussion.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-6">
            Farmer Discussion Forum
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with other farmers and experts. Share knowledge, ask questions, and find innovative solutions to farming challenges.
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-red-50 text-red-700 p-6 rounded-2xl flex items-center gap-3 shadow-sm border border-red-100"
            >
              <FaExclamationCircle className="text-2xl" />
              <p className="font-medium">{error}</p>
              <button
                className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                onClick={() => setError(null)}
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-10 backdrop-blur-sm bg-white/90"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-1/2 group">
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 group-hover:bg-white"
              />
              <FaSearch className="absolute left-4 top-4 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                <FaFilter className="text-green-600" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="p-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
                >
                  {tags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                <FaSortAmountDown className="text-green-600" />
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="p-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
                >
                  <option value="recent">Most Recent</option>
                  <option value="likes">Most Liked</option>
                  <option value="replies">Most Replies</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ask Question Section */}
        <div className="mb-10">
          {user ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <button
                onClick={() => setShowNewQuestionForm(!showNewQuestionForm)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-3"
              >
                {showNewQuestionForm ? (
                  <>
                    <FaTimes className="text-xl" />
                    Cancel
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-xl" />
                    Ask a Question
                  </>
                )}
              </button>

              <AnimatePresence>
                {showNewQuestionForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-8 mt-6"
                  >
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Ask a Question</h3>
                    <form onSubmit={handlePostQuestion} className="space-y-6">
                      <div>
                        <textarea
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Describe your farming question or issue in detail..."
                          rows="4"
                          required
                          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50"
                        />
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <FaTags className="text-green-500" />
                          Select Tags (Optional)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tags.filter(tag => tag !== 'All').map(tag => (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              key={tag}
                              onClick={() => handleTagSelection(tag)}
                              className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                                newQuestionTags.includes(tag)
                                  ? 'bg-green-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {tag}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Post Question
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 p-6 rounded-2xl text-center border border-yellow-100"
            >
              <p className="text-yellow-700 mb-3 font-medium">Please log in to post questions and participate in discussions</p>
              <Link
                to="/login"
                className="text-green-600 font-semibold hover:text-green-700 transition-colors inline-flex items-center gap-2"
              >
                Log in now <FaArrowRight className="text-sm" />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Discussions List */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-6 text-xl text-green-700 font-medium">Loading discussions...</p>
          </motion.div>
        ) : filteredDiscussions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg"
          >
            <div className="text-green-500 mb-4">
              <FaComments className="text-6xl mx-auto" />
            </div>
            <p className="text-2xl text-gray-600 mb-2">No discussions found</p>
            <p className="text-gray-500">Be the first to start a discussion!</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
            ref={discussionEndRef}
          >
            {filteredDiscussions.map((discussion) => (
              <motion.div
                key={discussion._id}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full mt-1">
                      <FaUser className={discussion.author.role === 'expert' ? "text-blue-600" : "text-green-600"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {discussion.author.username}
                            {discussion.author.role === 'expert' && (
                              <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">Expert</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{new Date(discussion.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          {discussion.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-gray-700">
                          {expandedDiscussion === discussion._id
                            ? discussion.content
                            : discussion.content.length > 300
                              ? `${discussion.content.substring(0, 300)}...`
                              : discussion.content
                          }
                        </p>
                        {discussion.content.length > 300 && (
                          <button
                            onClick={() => setExpandedDiscussion(expandedDiscussion === discussion._id ? null : discussion._id)}
                            className="text-green-600 text-sm mt-2 hover:underline"
                          >
                            {expandedDiscussion === discussion._id ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(discussion._id)}
                            className={`flex items-center gap-1 text-sm ${user && discussion.likes.includes(user._id)
                                ? 'text-green-600'
                                : 'text-gray-500 hover:text-gray-700'
                              }`}
                            disabled={!user}
                          >
                            <FaThumbsUp />
                            <span>{discussion.likes?.length || 0}</span>
                          </button>

                          <button
                            onClick={() => setReplyingTo(replyingTo === discussion._id ? null : discussion._id)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                            disabled={!user}
                          >
                            <FaReply />
                            <span>Reply ({discussion.replies?.length || 0})</span>
                          </button>
                        </div>

                        {user && discussion.author._id === user._id && (
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteDiscussion(discussion._id)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      {/* Replies */}
                      {(discussion.replies?.length > 0 || replyingTo === discussion._id) && (
                        <div className="mt-4 pl-6 border-l-2 border-gray-100">
                          {discussion.replies?.map((reply) => (
                            <div key={reply._id} className="mb-4 last:mb-0">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${reply.author.role === 'expert' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                  <FaUser className={reply.author.role === 'expert' ? "text-blue-600 text-sm" : "text-gray-600 text-sm"} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-800">
                                      {reply.author.username}
                                      {reply.author.role === 'expert' && (
                                        <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">Expert</span>
                                      )}
                                    </h4>
                                    <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</span>
                                  </div>
                                  <p className="text-gray-700 mt-1">{reply.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Reply Form */}
                          {replyingTo === discussion._id && user && (
                            <div className="mt-4">
                              <div className="flex flex-col gap-2">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="Write your reply..."
                                  rows="2"
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  disabled={isSubmitting}
                                />
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setReplyingTo(null)}
                                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                                    disabled={isSubmitting}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handlePostReply(discussion._id)}
                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!replyContent.trim() || isSubmitting}
                                  >
                                    {isSubmitting ? (
                                      <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Sending...
                                      </div>
                                    ) : (
                                      'Reply'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Help Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 right-8"
        >
          <Link to="/experts">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-medium p-6 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <span className="sr-only">Get Expert Help</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default DiscussionPage;