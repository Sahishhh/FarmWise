import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaImage, FaPaperPlane, FaRobot } from "react-icons/fa";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: import.meta.env.VITE_REACT_APP_GROK_API_KEY, dangerouslyAllowBrowser: true  });

const AiPage = () => {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "Hello! I'm your AI farming assistant. How can I help you today? You can ask me about crop diseases, soil health, or upload an image for analysis.",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to handle Groq API response
  const handleGroqResponse = async (query) => {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert farming assistant. Provide detailed, accurate information about agriculture, crop diseases, and farming practices."
          },
          {
            role: "user",
            content: query
          }
        ],
        model: "llama-3.3-70b-versatile",
      });

      return chatCompletion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Error:", error);
      return "I apologize, but I'm having trouble processing your request. Please try again.";
    }
  };

  // Function to send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) {
      alert("Please enter a message or upload an image.");
      return;
    }

    // Add user's message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", content: input, image: selectedImage },
    ]);

    setLoading(true);

    try {
      let responseContent;
      
      if (selectedImage) {
        // Handle image analysis
        const formData = new FormData();
        formData.append("file", selectedImage);

        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to analyze image");
        }

        const data = await response.json();
        responseContent = `Plant: ${data.plant_name} 🌱\nDisease: ${data.disease} 🦠`;
      } else {
        // Handle text query using Groq API
        responseContent = await handleGroqResponse(input);
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", content: responseContent },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", content: "Error processing your request. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setInput("");
      setSelectedImage(null);
    }
  };

  // Function to handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setInput(""); // Clear text input when image is selected
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-green-600 p-4 text-white flex items-center">
            <FaRobot className="text-2xl mr-2" />
            <h1 className="text-xl font-semibold">AI Farming Assistant</h1>
          </div>

          {/* Chat Messages */}
          <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${message.type === "user"
                    ? "bg-green-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>
                  {message.image && <img src={URL.createObjectURL(message.image)} alt="Uploaded" className="max-w-xs rounded-lg mb-2" />}
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="p-2 border-t flex justify-center">
              <div className="relative inline-block">
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-20 rounded-lg" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">×</button>
              </div>
            </div>
          )}

          {/* Input Section */}
          <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200">
                  <FaImage className="text-xl" />
                </motion.div>
              </label>

              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={selectedImage ? "Press send to analyze image..." : "Ask me anything about farming..."} 
                className="flex-1 rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />

              <motion.button 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                type="submit" 
                className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700" 
                disabled={loading || (!input.trim() && !selectedImage)}
              >
                <FaPaperPlane className="text-xl" />
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Features Section */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pb-10">
          {[
            { title: "Image Analysis", description: "Upload photos of your crops for disease detection and health analysis" },
            { title: "Expert Knowledge", description: "Get AI-powered answers based on agricultural expertise" },
            { title: "24/7 Assistance", description: "Get help anytime with your farming queries" },
          ].map((feature, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="font-semibold text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AiPage;