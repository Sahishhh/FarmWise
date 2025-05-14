import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaStar, FaCalendarAlt, FaSearch, FaTimes, FaUser, FaFilter, FaLeaf } from 'react-icons/fa';

const LoadingSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {[...Array(6)].map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden relative"
                >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                    </div>

                    <div className="p-6 relative">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-gray-100 w-12 h-12 rounded-full" />
                            <div className="space-y-2">
                                <div className="bg-gray-100 h-6 w-32 rounded" />
                                <div className="bg-gray-100 h-4 w-24 rounded" />
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-gray-100 h-5 w-5 rounded" />
                                <div className="bg-gray-100 h-4 w-40 rounded" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-gray-100 h-5 w-5 rounded" />
                                <div className="bg-gray-100 h-4 w-32 rounded" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="bg-gray-100 h-4 w-24 rounded mb-2" />
                            <div className="flex flex-wrap gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-gray-100 h-6 w-20 rounded-full" />
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="bg-gray-100 h-4 w-16 rounded mb-2" />
                            <div className="space-y-2">
                                <div className="bg-gray-100 h-3 w-full rounded" />
                                <div className="bg-gray-100 h-3 w-4/5 rounded" />
                                <div className="bg-gray-100 h-3 w-3/4 rounded" />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 bg-gray-100 h-10 rounded-xl" />
                            <div className="flex-1 bg-gray-100 h-10 rounded-xl" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

const ExpertsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('All');
    const [bookingExpert, setBookingExpert] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingMessage, setBookingMessage] = useState('');

    const specializations = ['All', 'Crop Management', 'Soil Health', 'Pest Control', 'Organic Farming', 'Irrigation'];

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('http://127.0.0.1:9000/api/farmwise/expert', {
                    withCredentials: true
                });
                setExperts(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch experts:', error);
                setError('Failed to load experts. Please try again later.');
                setLoading(false);
            }
        };

        fetchExperts();
    }, []);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Please log in to book an appointment');
            return;
        }

        try {
            const response = await axios.post('http://localhost:9000/api/farmwise/booking/apply', {
                expertId: bookingExpert._id,
                userId: user._id,
                date: bookingDate,
                time: bookingTime,
                message: bookingMessage
            }, {
                withCredentials: true
            });
            alert('Appointment booked successfully!');
            setBookingExpert(null);
            setBookingDate('');
            setBookingTime('');
            setBookingMessage('');
        } catch (error) {
            console.error('Failed to book appointment:', error);
            setError('Failed to book appointment. Please try again.');
        }
    };

    const startChat = async (expertId) => {
        if (!user) {
            setError('Please log in to chat with experts');
            return;
        }

        try {
            const response = await axios.post('http://localhost:9000/api/farmwise/conversations', {
                recipientId: expertId
            }, {
                withCredentials: true
            });
            window.location.href = '/chat';
        } catch (error) {
            console.error('Failed to start conversation:', error);
            setError('Failed to start conversation. Please try again.');
        }
    };

    const filteredExperts = experts.filter(expert => {
        if (!expert.verified) return false;
        const matchesSearch = expert.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expert.specialization?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
            expert.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expert.about?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecialization = selectedSpecialization === 'All' ||
            expert.specialization?.includes(selectedSpecialization);

        return matchesSearch && matchesSpecialization;
    });

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
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-10">
            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        className="flex justify-center mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <FaLeaf className="text-green-500 text-4xl" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-green-700 mb-4">Consult with Farming Experts</h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Connect with verified agricultural experts specialized in various farming domains. Book consultations to get personalized advice for your farming needs.
                    </p>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 shadow-sm"
                    >
                        <p>{error}</p>
                        <button
                            className="ml-auto text-red-500 hover:text-red-700"
                            onClick={() => setError(null)}
                        >
                            <FaTimes />
                        </button>
                    </motion.div>
                )}

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl shadow-lg p-6 mb-8 backdrop-blur-sm bg-opacity-90"
                >
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <motion.div
                            variants={itemVariants}
                            className="relative w-full md:w-1/2"
                        >
                            <input
                                type="text"
                                placeholder="Search experts by name, specialization or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            />
                            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-2 w-full md:w-auto"
                        >
                            <FaFilter className="text-gray-600" />
                            <select
                                value={selectedSpecialization}
                                onChange={(e) => setSelectedSpecialization(e.target.value)}
                                className="p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            >
                                {specializations.map(specialization => (
                                    <option key={specialization} value={specialization}>
                                        {specialization}
                                    </option>
                                ))}
                            </select>
                        </motion.div>
                    </div>
                </motion.div>

                {loading ? (
                    <LoadingSkeleton />
                ) : filteredExperts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 bg-white rounded-2xl shadow-lg"
                    >
                        <p className="text-xl text-gray-600">No experts found matching your criteria</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredExperts.map((expert) => (
                            <motion.div
                                key={expert._id}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className="bg-green-100 p-3 rounded-full"
                                        >
                                            <FaUser className="text-green-600 text-2xl" />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800">{expert.userId.fullname}</h3>
                                            <div className="flex items-center text-yellow-500 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={i < 4 ? "text-yellow-500" : "text-gray-300"}
                                                    />
                                                ))}
                                                <span className="ml-1 text-gray-600 text-sm">(4.0)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <motion.div
                                            whileHover={{ x: 5 }}
                                            className="flex items-center gap-2 text-gray-600"
                                        >
                                            <FaGraduationCap className="text-green-600" />
                                            <span>{expert.degreeOrCirtification}</span>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ x: 5 }}
                                            className="flex items-center gap-2 text-gray-600"
                                        >
                                            <FaBriefcase className="text-green-600" />
                                            <span>{expert.experience} years of experience</span>
                                        </motion.div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-700 mb-2">Specialization</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {expert.specialization?.map((spec, index) => (
                                                <motion.span
                                                    key={index}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                                                >
                                                    {spec}
                                                </motion.span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-700 mb-2">About</h4>
                                        <p className="text-gray-600 text-sm line-clamp-3">{expert.about}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setBookingExpert(expert)}
                                            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FaCalendarAlt />
                                            Book Consultation
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => startChat(expert.userId?._id)}
                                            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                                        >
                                            Chat Now
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <AnimatePresence>
                    {bookingExpert && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">Book Consultation with {bookingExpert.userId.fullname}</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setBookingExpert(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </motion.button>
                                </div>

                                <form onSubmit={handleBookingSubmit} className="space-y-4">
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="space-y-2"
                                    >
                                        <label className="block text-gray-700">Date</label>
                                        <input
                                            type="date"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                        />
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="space-y-2"
                                    >
                                        <label className="block text-gray-700">Time</label>
                                        <input
                                            type="time"
                                            value={bookingTime}
                                            onChange={(e) => setBookingTime(e.target.value)}
                                            required
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                        />
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="space-y-2"
                                    >
                                        <label className="block text-gray-700">Message</label>
                                        <textarea
                                            value={bookingMessage}
                                            onChange={(e) => setBookingMessage(e.target.value)}
                                            placeholder="Describe your farming issues or questions..."
                                            rows="4"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                        />
                                    </motion.div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                                    >
                                        Confirm Booking
                                    </motion.button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ExpertsPage; 