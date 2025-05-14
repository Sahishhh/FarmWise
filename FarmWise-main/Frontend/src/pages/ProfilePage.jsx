import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaGraduationCap, FaBriefcase, FaMapMarkerAlt,
  FaEdit, FaTrash, FaCalendarAlt, FaCheckCircle, FaFileUpload, FaInfoCircle, FaHourglassHalf, FaPaperclip
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [userBlogs, setUserBlogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('idle');
  const [applicationError, setApplicationError] = useState('');
  const [degree, setDegree] = useState('');
  const [proofDocumentFile, setProofDocumentFile] = useState(null);
  const [adharPanDocumentFile, setAdharPanDocumentFile] = useState(null);
  const [experience, setExperience] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [about, setAbout] = useState('');

  useEffect(() => {
    if (user?.userType === 'expert') {
      setDegree(user.expertDegreeOrCertification || '');
      setExperience(user.experience || '');
      setCity(user.city || '');
      setCountry(user.country || '');
      setAbout(user.expertAbout || '');
    }
  }, [user, showApplyForm]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        // const blogRes = await axios.get(`http://localhost:9000/api/farmwise/blog/user/${user._id}`, { withCredentials: true });
        // setUserBlogs(blogRes.data.data || []);
        
        const apptEndpoint = user.userType === 'expert'
          ? `http://localhost:9000/api/farmwise/expert/${user._id}`
          : `http://localhost:9000/api/farmwise/booking/${user._id}`;
          
          const apptRes = await axios.get(apptEndpoint, { withCredentials: true });
          console.log(apptRes.data.data  );

    
        if(user.userType === 'expert') {
          setAppointments(apptRes.data.data);
        }
        else {
        setAppointments(apptRes.data);
        
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id, user?.userType]);
  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await axios.delete(`http://localhost:9000/api/farmwise/blog/${id}`, { withCredentials: true });
      setUserBlogs(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error('Error deleting blog:', err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.name === 'proofDocument') {
        setProofDocumentFile(e.target.files[0]);
      } else if (e.target.name === 'adharPanDocument') {
        setAdharPanDocumentFile(e.target.files[0]);
      }
    } else {
      if (e.target.name === 'proofDocument') {
        setProofDocumentFile(null);
      } else if (e.target.name === 'adharPanDocument') {
        setAdharPanDocumentFile(null);
      }
    }
  };

  const handleApplyAsExpert = async (e) => {
    e.preventDefault();
    setApplicationStatus('submitting');
    setApplicationError('');

    try {
      // Validate required fields
      if (!degree || !experience || !city || !country || !about) {
        setApplicationError('Please fill in all required fields.');
        setApplicationStatus('error');
        return;
      }

      if (isNaN(Number(experience)) || Number(experience) < 0) {
        setApplicationError('Experience must be a positive number.');
        setApplicationStatus('error');
        return;
      }

      // Validate files if not an expert
      if (user.userType !== 'expert') {
        if (!proofDocumentFile || !adharPanDocumentFile) {
          setApplicationError('Please upload both required documents.');
          setApplicationStatus('error');
          return;
        }
      }

      const formData = new FormData();
      
      // Add text fields
      formData.append('degreeOrCirtification', degree);
      formData.append('experience', Number(experience));
      formData.append('city', city);
      formData.append('country', country);
      formData.append('about', about);

      // Add files with proper field names
      if (proofDocumentFile) {
        formData.append('proofDocument', proofDocumentFile);
      }
      if (adharPanDocumentFile) {
        formData.append('adharPanDocument', adharPanDocumentFile);
      }

      // Log form data for debugging
      console.log('Form Data Contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(
        `http://localhost:9000/api/farmwise/expert/${user._id}/verify`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setApplicationStatus('submitted');
        setShowApplyForm(false);
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Failed to submit information');
      }
    } catch (err) {
      console.error('Detailed error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      setApplicationError(
        err.response?.data?.message || 
        err.message || 
        'Failed to submit information. Please try again.'
      );
      setApplicationStatus('error');
    }
  };

  const formatStatus = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 text-sm rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center pt-24">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-green-700 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }
  const handleAccept = async (id) => {
    try {
      const res = await axios.put(`http://localhost:9000/api/farmwise/booking/accept/${id}`, {}, { withCredentials: true });
      console.log(res.data.message);
      // Refresh the appointments list
      const updatedAppointments = appointments.map((appt) =>
        appt._id === id ? { ...appt, status: 'accepted' } : appt
      );
      console.log(updatedAppointments);
    } catch (error) {
      console.error("Failed to accept booking:", error);
    }
  };



  return (
    <div className="min-h-screen pt-20 bg-gray-50 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="bg-green-100 p-6 rounded-full">
              <FaUser className="text-green-600 text-4xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
              <p className="text-green-600">{user.userType === 'expert' ? 'Farming Expert' : 'Community Member'}</p>
              <p className="text-gray-500 mt-2">{user.email}</p>

              {user.userType === 'expert' && (
                <div className="mt-4 space-y-2 text-gray-600">
                  <p><FaGraduationCap className="inline text-green-500 mr-2" /> {user.expertDegreeOrCertification}</p>
                  <p><FaBriefcase className="inline text-green-500 mr-2" /> {user.experience} years experience</p>
                  <p><FaMapMarkerAlt className="inline text-green-500 mr-2" /> {user.city}, {user.country}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex border-b mb-6">
          <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 ${activeTab === 'profile' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}>Profile</button>
          {user.userType === 'expert' && (
            <button onClick={() => setActiveTab('blogs')} className={`px-6 py-3 ${activeTab === 'blogs' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}>My Blogs</button>
          )}
          <button onClick={() => setActiveTab('appointments')} className={`px-6 py-3 ${activeTab === 'appointments' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}>Appointments</button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow">
            <div className="mb-6 pb-6 border-b">
              {user.userType === 'expert' ? (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Expert Details</h3>
                  <p className="text-gray-600 mb-4">Review or update your expert information below.</p>
                  <div className="mb-4 space-y-2 text-gray-600">
                    {user.expertDegreeOrCertification && <p><FaGraduationCap className="inline text-green-500 mr-2" /> {user.expertDegreeOrCertification}</p>}
                    {user.experience && <p><FaBriefcase className="inline text-green-500 mr-2" /> {user.experience} years experience</p>}
                    {(user.city && user.country) && <p><FaMapMarkerAlt className="inline text-green-500 mr-2" /> {user.city}, {user.country}</p>}
                    {user.expertAbout && <p className="mt-2">{user.expertAbout}</p>}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Become an Expert</h3>
                  <p className="text-gray-600 mb-4">Interested in sharing your knowledge? Fill out the application form.</p>
                </div>
              )}
              <button
                onClick={() => setShowApplyForm(!showApplyForm)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
              >
                <FaEdit />
                {showApplyForm ? 'Cancel Update/Application' : (user.userType === 'expert' ? 'Update Expert Info' : 'Apply as Expert')}
              </button>
            </div>

            <AnimatePresence>
              {showApplyForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4 className="text-lg font-semibold mb-4">
                    {user.userType === 'expert' ? 'Update Expert Information' : 'Expert Application Form'}
                  </h4>
                  <form onSubmit={handleApplyAsExpert} className="space-y-4">
                    <div>
                      <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">Degree or Certification *</label>
                      <input type="text" id="degree" value={degree} onChange={(e) => setDegree(e.target.value)} required className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
                      <input type="number" id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} required min="0" className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <input type="text" id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label htmlFor="proofDocument" className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Proof Document {user.userType !== 'expert' ? '*' : '(Optional - only if updating)'}
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <label htmlFor="proofDocument" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                          <FaFileUpload className="inline-block mr-2" /> Choose File
                        </label>
                        <input type="file" id="proofDocument" name="proofDocument" onChange={handleFileChange} required={user.userType !== 'expert'} accept=".pdf,.jpg,.jpeg,.png" className="sr-only" />
                        {proofDocumentFile && (<span className="text-sm text-gray-600 flex items-center gap-1"><FaPaperclip className="text-green-500" /> {proofDocumentFile.name}</span>)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Upload certificate/license (PDF, JPG, PNG). {user.userType === 'expert' && 'Leave blank if not changing.'}</p>
                    </div>
                    <div>
                      <label htmlFor="adharPanDocument" className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Adhar/PAN Document *
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <label htmlFor="adharPanDocument" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                          <FaFileUpload className="inline-block mr-2" /> Choose File
                        </label>
                        <input type="file" id="adharPanDocument" name="adharPanDocument" onChange={handleFileChange} required accept=".pdf,.jpg,.jpeg,.png" className="sr-only" />
                        {adharPanDocumentFile && (<span className="text-sm text-gray-600 flex items-center gap-1"><FaPaperclip className="text-green-500" /> {adharPanDocumentFile.name}</span>)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Upload Adhar Card or PAN Card (PDF, JPG, PNG)</p>
                    </div>
                    <div>
                      <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">About Me *</label>
                      <textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} required rows="4" className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"></textarea>
                    </div>
                    {applicationStatus === 'error' && (<p className="text-red-600 text-sm flex items-center gap-2"><FaInfoCircle /> {applicationError}</p>)}
                    <button type="submit" disabled={applicationStatus === 'submitting'} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors">
                      {applicationStatus === 'submitting' ? 'Submitting...' : (user.userType === 'expert' ? 'Update Information' : 'Submit Application')}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'blogs' && (
          <>
            <div className="mb-4">
              <Link to="/blog">
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
                  <FaEdit /> Write New Blog
                </button>
              </Link>
            </div>
            {userBlogs.length === 0 ? (
              <div className="bg-white text-center p-6 rounded-xl shadow">
                <p className="text-gray-500">No blogs posted yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBlogs.map(blog => (
                  <motion.div key={blog._id} whileHover={{ scale: 1.03 }} className="bg-white rounded-xl shadow overflow-hidden">
                    <img
                      src={blog.blogPicture || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={blog.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{blog.content?.slice(0, 100)}...</p>
                      <div className="flex justify-between items-center">
                        <Link to={`/blog/${blog._id}`} className="text-green-600 text-sm hover:underline">Read More</Link>
                        <FaTrash
                          className="text-red-500 cursor-pointer hover:text-red-700"
                          onClick={() => handleDeleteBlog(blog._id)}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments found.</p>
          ) : (
            appointments.map((appt, i) => (
              <div key={i} className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {user.userType === 'expert' ? appt.userId.fullname : appt.expertId.fullname}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt /> {new Date(appt.date).toLocaleString()}
                    </p>
                  </div>
        
                  <div className="flex items-center gap-2">
                    {formatStatus(appt.status)}
                    {user.userType === 'expert' && appt.status === 'pending' && (
                      <button
                        onClick={() => handleAccept(appt._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        )}
      </div>
    </div>
  );
};

export default ProfilePage
