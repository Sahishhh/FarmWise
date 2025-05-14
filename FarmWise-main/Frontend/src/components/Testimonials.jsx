import React,{ useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Amit Sharma",
    role: "Organic Farmer",
    quote: "Farmwise helped me increase my crop yield by 30% with AI recommendations!",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sita Patel",
    role: "Agri-Tech Researcher",
    quote: "AI-driven insights have revolutionized the way I farm organically.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    name: "Rahul Verma",
    role: "Sustainable Farming Expert",
    quote: "With Farmwise, I reduced pesticide usage by 50% and improved soil health.",
    image: "https://randomuser.me/api/portraits/men/28.jpg",
  },
  {
    name: "Saurabh Isane",
    role: "Isane Farming assocaition",
    quote: "With Farmwise, I reduced pesticide usage by 50% and improved soil health.",
    image: "https://randomuser.me/api/portraits/men/28.jpg",
  },
  {
    name: "Sahil Ghatage",
    role: "Sustainable Farming Expert",
    quote: "With Farmwise, I reduced pesticide usage by 50% and improved soil health.",
    image: "https://randomuser.me/api/portraits/men/28.jpg",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">What Farmers Say</h2>
      <div className="relative w-[300px] md:w-[400px] h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
            className="absolute flex flex-col items-center bg-white shadow-lg p-6 rounded-2xl text-center border border-gray-200"
          >
            <img
              src={testimonials[index].image}
              alt={testimonials[index].name}
              className="w-20 h-20 rounded-full mb-4 shadow-md"
            />
            <p className="text-lg text-gray-700 italic">"{testimonials[index].quote}"</p>
            <h3 className="font-semibold text-gray-900 mt-4">{testimonials[index].name}</h3>
            <span className="text-sm text-gray-500">{testimonials[index].role}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
