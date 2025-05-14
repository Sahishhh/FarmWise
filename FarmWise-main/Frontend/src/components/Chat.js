import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import socketService from '../services/socket.service';
import messageService from '../services/message.service';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { chatId } = useParams();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await messageService.getMessages(chatId);
        setMessages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load messages');
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      socketService.connect(userId);

      socketService.on('newMessage', (message) => {
        if (message.chatId === chatId) {
          setMessages(prev => [...prev, message]);
        }
      });

      return () => {
        socketService.off('newMessage');
        socketService.disconnect();
      };
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await messageService.sendMessage(chatId, newMessage);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.sender === localStorage.getItem('userId') ? 'sent' : 'received'}`}
          >
            <p>{message.content}</p>
            <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat; 