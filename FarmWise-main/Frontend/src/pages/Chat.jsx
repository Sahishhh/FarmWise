import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'react-lottie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socketService from '../services/socket.service';
import { useSelector } from 'react-redux';

const BACKEND_URL = 'http://localhost:9000';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Get current user from localStorage
  const { user } = useSelector((state) => state.auth);
    const { accessToken } = useSelector((state) => state.auth);
  // const currentUser = user;
  // console.log(currentUser);

  useEffect(() => {
    const userId = user?._id;
    const token = accessToken

    if (!userId || !token) {
      console.error('User ID or token not found');
      return;
    }

    // Initialize socket connection
    const newSocket = socketService.connect(userId);
    if (!newSocket) {
      console.error('Failed to initialize socket connection');
      return;
    }

    setSocket(newSocket);

    // Fetch initial messages
    fetchMessages();

    // Socket event listeners
    newSocket.on('receiveMessage', handleNewMessage);
    newSocket.on('userTyping', handleUserTyping);
    newSocket.on('error', handleSocketError);

    return () => {
      if (newSocket) {
        newSocket.off('receiveMessage');
        newSocket.off('userTyping');
        newSocket.off('error');
        socketService.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/farmwise/messages/get`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        setMessages(response.data.data.map(formatMessage));
      }
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, formatMessage(message)]);
    scrollToBottom();
  };

  const handleUserTyping = (userId) => {
    if (userId !== user?._id) {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleSocketError = (error) => {
    setError(error.message);
    console.error('Socket error:', error);
  };

  const formatMessage = (message) => ({
    id: message._id,
    text: message.message,
    sender: {
      id: message.user._id,
      name: message.user.username,
      avatar: message.user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user.username}`
    },
    timestamp: new Date(message.createdAt),
    status: 'sent',
    replyTo: message.replyTo ? {
      text: message.replyTo.message,
      sender: {
        name: message.replyTo.user.username
      }
    } : null,
    images: message.image ? [message.image] : []
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!socket) return;

    if (newMessage.trim() || fileInputRef.current?.files?.length) {
      try {
        const formData = new FormData();
        formData.append('message', newMessage.trim());
        
        if (fileInputRef.current?.files?.length) {
          const file = fileInputRef.current.files[0];
          formData.append('image', file);
        }

        if (replyTo) {
          formData.append('replyTo', replyTo.id);
        }

        // Send message to backend
        const response = await axios.post(
          `${BACKEND_URL}/api/farmwise/messages/send`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          }
        );

        if (response.data.success) {
          // Emit message through socket
          socket.emit('sendMessage', {
            userId: user._id,
            message: newMessage.trim(),
            replyTo: replyTo?.id,
            image: response.data.data.image
          });

          setNewMessage('');
          setReplyTo(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } catch (error) {
        setError('Failed to send message');
        console.error('Error sending message:', error);
      }
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    setNewMessage('');
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('userTyping', user._id);
    }
  };

  const Message = ({ message, index }) => {
    const isCurrentUser = message.sender.id === user._id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] items-end group`}>
          <motion.img 
            whileHover={{ scale: 1.1 }}
            src={message.sender.avatar} 
            alt={message.sender.name}
            className="w-8 h-8 rounded-full"
          />
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`mx-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Name */}
            <div className={`text-xs font-medium mb-1 ${
              isCurrentUser ? 'text-right text-green-600' : 'text-left text-gray-600'
            }`}>
              {message.sender.name}
            </div>

            <div className={`rounded-2xl p-4 ${
              isCurrentUser 
                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200'
            } shadow-md hover:shadow-lg transition-shadow duration-300`}>
              {message.replyTo && (
                <div className={`mb-2 p-2 rounded-lg ${
                  isCurrentUser ? 'bg-green-600/30' : 'bg-gray-200/50'
                } text-sm`}>
                  <div className="font-medium">{message.replyTo.sender.name}</div>
                  <div className="truncate">{message.replyTo.text}</div>
                </div>
              )}

              <p className="mb-1">{message.text}</p>

              {message.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {message.images.map((image, idx) => (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      key={idx}
                      src={image}
                      alt={`Shared image ${idx + 1}`}
                      className="rounded-lg max-w-xs cursor-pointer"
                      onClick={() => {/* Add image preview functionality */}}
                    />
                  ))}
                </div>
              )}

              <div className={`text-xs mt-1 ${
                isCurrentUser ? 'text-white/70' : 'text-gray-500'
              }`}>
                {format(new Date(message.timestamp), 'HH:mm')}
              </div>
            </div>

            {/* Message Actions - Only show on hover */}
            <div className={`flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isCurrentUser ? 'justify-end' : 'justify-start'
            }`}>
              <button 
                onClick={() => handleReply(message)}
                className="text-xs text-gray-500 hover:text-green-600 transition-colors duration-200"
              >
                Reply
              </button>
              <button 
                className="text-xs text-gray-500 hover:text-green-600 transition-colors duration-200"
              >
                React
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Chat Header */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="flex items-center p-4 bg-white shadow-md z-10"
      >
        
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <Message key={message.id} message={message} index={index} />
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-gray-500"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
            </div>
            <span className="text-sm">Typing...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.form 
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        onSubmit={handleSendMessage} 
        className="p-4 bg-white shadow-lg"
      >
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-green-500 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </motion.button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={() => setNewMessage(newMessage + ' ')}
          />

          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 p-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow duration-200"
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            className="p-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
