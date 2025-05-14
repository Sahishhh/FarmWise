import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/features/authSlice';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    mobileno: '',
    userType: '',
    specialization: [],
    username: '',
  });
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setFormData(prev => ({
      ...prev,
      userType: type,
      specialization: type === 'expert' ? [] : []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      ...formData,
      specialization: userType === 'expert' ? formData.specialization : []
    };

    try {
      const resultAction = await dispatch(registerUser(userData)).unwrap();
      if (resultAction) {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };
  
  return (
    <>
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-green-600 mb-2">Create Account</h2>
            <p className="text-gray-600">Join our farming community today</p>
          </motion.div>

          {!userType ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4 mt-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUserTypeSelect('farmer')}
                className="cursor-pointer p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 text-center"
              >
                <img
                  src="/farmer-icon.jpg"
                  alt="Farmer"
                  className="w-24 h-24 mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900">I'm a Farmer</h3>
                <p className="text-sm text-gray-500 mt-2">Join to get expert advice and connect with other farmers</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUserTypeSelect('expert')}
                className="cursor-pointer p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 text-center"
              >
                <img
                  src="/expert-icon.jpg"
                  alt="Expert"
                  className="w-24 h-24 mx-auto mb-4 rounded-full"
                />
                <h3 className="text-lg font-semibold text-gray-900">I'm an Expert</h3>
                <p className="text-sm text-gray-500 mt-2">Share your knowledge and help farmers succeed</p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 space-y-6"
            >
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">Full Name</label>
                  <input
                    id="name"
                    name="fullname"
                    type="text"
                    required
                    value={formData.fullname}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label htmlFor="name" className="sr-only">User Name</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="User Name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="mobileNumber" className="sr-only">Mobile Number</label>
                  <input
                    id="mobileNumber"
                    name="mobileno"
                    type="number"
                    required
                    value={formData.mobileno}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Mobile Number"
                  />
                </div>
                {userType === 'expert' && (
                  <div>
                    <label htmlFor="specialization" className="sr-only">Specialization</label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      required
                      value={formData.specialization.join(', ')}
                      onChange={(e) => {
                        const newSpecializations = e.target.value
                          .split(',')
                          .map(s => s.trim())
                          .filter(s => s !== '');
                        setFormData(prev => ({
                          ...prev,
                          specialization: newSpecializations
                        }));
                      }}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                      placeholder="Specialization (e.g., Soil Expert, Crop Specialist)"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Separate multiple specializations with commas
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </motion.button>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setUserType("")}
                  className="text-sm text-green-600 hover:text-green-500"
                >
                  ← Back to selection
                </button>
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="font-medium text-green-600 hover:text-green-500">
                    Sign in
                  </a>
                </p>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </>
  );
};

export default Signup; 