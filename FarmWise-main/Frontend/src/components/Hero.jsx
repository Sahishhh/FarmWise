import React from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <div className="relative w-full h-[80vh] flex items-center justify-center">
      <img
        src="/heroImage.jpg" 
        alt="Farmer in field"
        className="w-full h-[100vh] object-cover z-[-1] opacity-65"
      />
      
      <div className="absolute text-center px-6 top-1/3">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Empowering Farmers with <br /> AI & Technology
        </motion.h1>
        <motion.p 
          className="mt-4 text-lg md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Optimize organic farming practices with AI-powered recommendations,
          live insights, and expert consultations.
        </motion.p>
        
        <motion.button
          className="mt-6 bg-green-500 hover:bg-green-600 hover:cursor-pointer text-white font-semibold px-6 py-3 rounded-full text-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Get Started
        </motion.button>
      </div>
    </div>
  );
};

export default HeroSection;
