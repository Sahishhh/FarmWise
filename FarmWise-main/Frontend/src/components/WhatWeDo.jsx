import React, { useEffect } from "react";
import { FaComments, FaRobot, FaNewspaper, FaArrowRight } from "react-icons/fa";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

export default function WhatWeDo() {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.2,
        triggerOnce: true
    });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: {
            y: 50,
            opacity: 0
        },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const services = [
        {
            icon: <FaComments className="text-green-500 text-5xl mx-auto mb-4" />,
            title: "Expert Guidance",
            description: "Connect with agricultural experts to get personalized advice on farming practices.",
            link: "/expert-guidance"
        },
        {
            icon: <FaRobot className="text-green-500 text-5xl mx-auto mb-4" />,
            title: "AI-Powered Assistance",
            description: "Use AI-based analysis for crop health, disease detection, and best organic farming techniques.",
            link: "/ai-assistance"
        },
        {
            icon: <FaNewspaper className="text-green-500 text-5xl mx-auto mb-4" />,
            title: "Latest Farming News",
            description: "Stay updated with real-time agricultural news, government policies, and market trends.",
            link: "/news"
        }
    ];

    return (
        <section className="py-16 bg-gray-100">
            <div className="container mx-auto px-6 text-center">
                <motion.h2
                    className="text-3xl font-bold text-gray-800 mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Our Features
                </motion.h2>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                    className="grid md:grid-cols-3 gap-8 pt-5"
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            className="bg-white p-6 rounded-2xl shadow-md transition-all duration-300 h-56 flex flex-col justify-between relative group"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                border: "2px solid #1a1a1a"
                            }}
                        >
                            <div>
                                <motion.div
                                    whileHover={{
                                        rotate: 360,
                                        scale: 1.2,
                                        transition: { duration: 0.5 }
                                    }}
                                >
                                    {service.icon}
                                </motion.div>
                                <h3 className="text-xl font-semibold text-gray-700">{service.title}</h3>
                                <p className="text-gray-600 mt-2">{service.description}</p>
                                <Link
                                    to={service.link}
                                    className="flex items-center justify-center pt-3 text-green-600 hover:text-green-700 font-medium"
                                >
                                    Check it out
                                    <FaArrowRight className="ml-2 text-sm" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
