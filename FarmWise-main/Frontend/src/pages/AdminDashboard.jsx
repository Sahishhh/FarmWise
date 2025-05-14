import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    FaUser, FaGraduationCap, FaBriefcase, FaMapMarkerAlt,
    FaCheck, FaTimes, FaEye, FaFileAlt, FaSearch, FaIdCard,
    FaUsers, FaCalendarAlt, FaChartBar, FaMapPin
} from 'react-icons/fa';

const AdminDashboard = () => {
    // Define proper types to avoid linter errors
    const { user } = useSelector((state) => state.auth || {});

    // State with proper typing
    const [experts, setExperts] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [farmersStatistics, setFarmersStatistics] = useState({
        totalFarmers: 0,
        newFarmers: 0,
        topLocations: [],
        monthlyJoins: {}
    });

    // Fetch experts data and farmers data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch experts
                const expertsResponse = await axios.get('http://localhost:9000/api/farmwise/expert', {
                    withCredentials: true
                });

                if (expertsResponse.data && expertsResponse.data.data) {
                    console.log("Expert data:", expertsResponse.data.data);
                    setExperts(expertsResponse.data.data || []);
                }

                // Fetch farmers
                const farmersResponse = await axios.get('http://localhost:9000/api/farmwise/users/getallfarmers', {
                    withCredentials: true
                });

                if (farmersResponse.data && farmersResponse.data.data) {
                    const farmersData = farmersResponse.data.data || [];
                    setFarmers(farmersData);

                    // Calculate statistics
                    calculateFarmerStats(farmersData);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate farmer statistics
    const calculateFarmerStats = (farmersData) => {
        if (!farmersData || farmersData.length === 0) return;

        // Calculate total farmers
        const totalFarmers = farmersData.length;

        // Calculate new farmers (joined in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newFarmers = farmersData.filter(farmer => {
            return farmer.createdAt && new Date(farmer.createdAt) >= thirtyDaysAgo;
        }).length;

        // Calculate top locations
        const locationCounts = {};
        farmersData.forEach(farmer => {
            if (farmer.city) {
                if (!locationCounts[farmer.city]) {
                    locationCounts[farmer.city] = 0;
                }
                locationCounts[farmer.city]++;
            }
        });

        const topLocations = Object.entries(locationCounts)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Calculate monthly joins
        const monthlyJoins = {};
        farmersData.forEach(farmer => {
            if (farmer.createdAt) {
                const date = new Date(farmer.createdAt);
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

                if (!monthlyJoins[monthYear]) {
                    monthlyJoins[monthYear] = 0;
                }
                monthlyJoins[monthYear]++;
            }
        });

        setFarmersStatistics({
            totalFarmers,
            newFarmers,
            topLocations,
            monthlyJoins
        });
    };

    // Handle verification status update
    const handleUpdateVerification = async (expertId, status) => {
        try {
            console.log(expertId)
            await axios.patch(`http://localhost:9000/api/farmwise/expert/admin/verify/${expertId}`,
                { status },
                { withCredentials: true }
            );

        

            // Close modal if open
            if (showDetailsModal && selectedExpert?._id === expertId) {
                setShowDetailsModal(false);
            }

            // Show success message
            alert(status ? 'Expert successfully verified!' : 'Expert set to pending status.');

        } catch (err) {
            console.error('Error updating verification status:', err);
            alert('Failed to update verification status');
        }
    };

    // Filter experts based on active tab and search term
    const filteredExperts = experts.filter(expert => {
        // Filter by verification status
        if (activeTab === 'pending' && expert.verified === true) return false;
        if (activeTab === 'verified' && expert.verified === false) return false;
        if (activeTab === 'dashboard') return false; // Don't show experts in dashboard tab

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                (expert.userId?.username || '').toLowerCase().includes(term) ||
                (expert.userId?.email || '').toLowerCase().includes(term) ||
                (expert.degreeOrCirtification || '').toLowerCase().includes(term) ||
                (expert.city || '').toLowerCase().includes(term) ||
                (expert.country || '').toLowerCase().includes(term)
            );
        }

        return true;
    });

    // View expert details and document
    const handleViewDetails = (expert) => {
        setSelectedExpert(expert);
        setShowDetailsModal(true);
    };

    // Format percentage
    const formatPercentage = (part, total) => {
        if (!total) return '0%';
        return `${((part / total) * 100).toFixed(1)}%`;
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center pt-24">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 rounded-full border-4 border-green-500 border-t-transparent"></div>
                    <p className="text-green-700 mt-4">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 bg-gray-50 pb-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow rounded-xl p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Platform management and statistics</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white shadow rounded-xl overflow-hidden mb-8">
                    <div className="flex border-b overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'dashboard' ? 'border-b-2 border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'pending' ? 'border-b-2 border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Pending Experts
                        </button>
                        <button
                            onClick={() => setActiveTab('verified')}
                            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'verified' ? 'border-b-2 border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Verified Experts
                        </button>
                    </div>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Farmers Card */}
                            <div className="bg-white p-6 rounded-xl shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Farmers</p>
                                        <p className="text-3xl font-bold text-gray-800 mt-1">{farmersStatistics.totalFarmers}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <FaUsers className="text-green-600 text-xl" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                    <FaCalendarAlt className="mr-1" /> Last updated: {new Date().toLocaleDateString()}
                                </p>
                            </div>

                            {/* New Farmers Card */}
                            <div className="bg-white p-6 rounded-xl shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm">New Farmers (30 days)</p>
                                        <p className="text-3xl font-bold text-gray-800 mt-1">{farmersStatistics.newFarmers}</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <FaChartBar className="text-purple-600 text-xl" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {formatPercentage(farmersStatistics.newFarmers, farmersStatistics.totalFarmers)} of total farmers
                                </p>
                            </div>

                            {/* Total Experts Card */}
                            <div className="bg-white p-6 rounded-xl shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Experts</p>
                                        <p className="text-3xl font-bold text-gray-800 mt-1">{experts.length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FaGraduationCap className="text-blue-600 text-xl" />
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs mt-2">
                                    <span className="text-green-600">Verified: {experts.filter(e => e.verified).length}</span>
                                    <span className="text-yellow-600">Pending: {experts.filter(e => !e.verified).length}</span>
                                </div>
                            </div>

                            {/* Top Location Card */}
                            <div className="bg-white p-6 rounded-xl shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-sm">Top Farmer Location</p>
                                        <p className="text-xl font-bold text-gray-800 mt-1">
                                            {farmersStatistics.topLocations.length > 0 ? farmersStatistics.topLocations[0].city : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <FaMapPin className="text-orange-600 text-xl" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {farmersStatistics.topLocations.length > 0
                                        ? `${farmersStatistics.topLocations[0].count} farmers (${formatPercentage(farmersStatistics.topLocations[0].count, farmersStatistics.totalFarmers)})`
                                        : 'No location data available'}
                                </p>
                            </div>
                        </div>

                        {/* Monthly Registration Chart */}
                        <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
                            <h3 className="text-lg font-semibold mb-6">Monthly Farmer Registrations</h3>
                            {Object.keys(farmersStatistics.monthlyJoins).length > 0 ? (
                                <div className="h-64 overflow-x-auto">
                                    <div className="flex items-end space-x-4 h-full px-4 pb-6 min-w-max">
                                        {Object.entries(farmersStatistics.monthlyJoins)
                                            .sort(([a], [b]) => {
                                                const [aMonth, aYear] = a.split('/');
                                                const [bMonth, bYear] = b.split('/');
                                                return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
                                            })
                                            .slice(-6) // Show last 6 months
                                            .map(([month, count], index) => {
                                                const maxCount = Math.max(...Object.values(farmersStatistics.monthlyJoins));
                                                const height = Math.max(20, (count / maxCount) * 80);

                                                const [monthNum, year] = month.split('/');
                                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                const monthName = monthNames[parseInt(monthNum) - 1] || monthNum;

                                                return (
                                                    <div key={index} className="flex flex-col items-center" style={{ minWidth: '80px' }}>
                                                        <div
                                                            className="bg-green-500 rounded-t-md w-12"
                                                            style={{ height: `${height}%` }}
                                                        ></div>
                                                        <div className="mt-2 text-xs text-gray-600">{monthName}<br />{year}</div>
                                                        <div className="text-sm font-medium">{count}</div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex justify-center items-center bg-gray-50 rounded">
                                    <p className="text-gray-500">No registration data available</p>
                                </div>
                            )}
                        </div>

                        {/* Top Locations Table */}
                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="text-lg font-semibold mb-6">Top Farmer Locations</h3>
                            {farmersStatistics.topLocations.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmers</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {farmersStatistics.topLocations.map((location, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{location.city}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.count}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatPercentage(location.count, farmersStatistics.totalFarmers)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">No location data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Filter and Search */}
                <div className="bg-white shadow rounded-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2 rounded-md ${activeTab === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setActiveTab('verified')}
                                className={`px-4 py-2 rounded-md ${activeTab === 'verified' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Verified
                            </button>
                        </div>
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Search experts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Experts List */}
                <div className="bg-white shadow rounded-xl overflow-hidden">
                    {error && (
                        <div className="p-4 text-center text-red-500 bg-red-50">
                            {error}
                        </div>
                    )}

                    {!error && filteredExperts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No expert verification requests found in this category.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expert</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredExperts.map((expert) => (
                                        <tr key={expert._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <FaUser className="text-green-500" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{expert.userId?.username || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{expert.userId?.email || 'No email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaGraduationCap className="text-green-500 mr-2" />
                                                    <span className="text-sm text-gray-900">{expert.degreeOrCirtification || 'Not specified'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaBriefcase className="text-green-500 mr-2" />
                                                    <span className="text-sm text-gray-900">{expert.experience || 0} years</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaMapMarkerAlt className="text-green-500 mr-2" />
                                                    <span className="text-sm text-gray-900">
                                                        {expert.city && expert.country
                                                            ? `${expert.city}, ${expert.country}`
                                                            : 'Location not specified'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${expert.verified === true ? 'bg-green-100 text-green-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                    {expert.verified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(expert)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    {/* Action buttons - available to all users now */}
                                                    {!expert.verified ? (
                                                        <button
                                                            onClick={() => handleUpdateVerification(expert._id, true)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Approve"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUpdateVerification(expert._id, false)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title="Set as Pending"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Expert Details Modal */}
            {showDetailsModal && selectedExpert && (
                <div className="fixed inset-0 backdrop-blur  bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-900">Expert Application Details</h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-lg mb-4">Personal Information</h4>
                                <p className="mb-2"><span className="font-medium">Name:</span> {selectedExpert.userId?.username || 'N/A'}</p>
                                <p className="mb-2"><span className="font-medium">Email:</span> {selectedExpert.userId?.email || 'N/A'}</p>
                                <p className="mb-2"><span className="font-medium">Degree/Certification:</span> {selectedExpert.degreeOrCirtification || 'N/A'}</p>
                                <p className="mb-2"><span className="font-medium">Experience:</span> {selectedExpert.experience || 0} years</p>
                                <p className="mb-2"><span className="font-medium">Location:</span> {selectedExpert.city && selectedExpert.country ? `${selectedExpert.city}, ${selectedExpert.country}` : 'N/A'}</p>
                                <p className="mb-2"><span className="font-medium">Status:</span> {selectedExpert.verified ? 'Verified' : 'Pending'}</p>
                                <p className="mb-2"><span className="font-medium">Applied on:</span> {new Date(selectedExpert.createdAt).toLocaleDateString()}</p>

                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">About</h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedExpert.about || 'No information provided'}</p>
                                </div>

                                {selectedExpert.specialization && selectedExpert.specialization.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">Specialization</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedExpert.specialization.map((spec, index) => (
                                                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Proof Document Section */}
                                <div>
                                    <h4 className="font-semibold text-lg mb-4">Proof Document</h4>
                                    {selectedExpert.proofDocument ? (
                                        <div className="border p-4 rounded-lg">
                                            {selectedExpert.proofDocument.includes('.pdf') ? (
                                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded">
                                                    <FaFileAlt className="text-4xl text-red-500 mb-2" />
                                                    <p className="text-gray-700 mb-2">PDF Document</p>
                                                    <a
                                                        href={selectedExpert.proofDocument}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <img
                                                        src={selectedExpert.proofDocument}
                                                        alt="Proof Document"
                                                        className="max-w-full h-auto rounded-lg shadow-md mb-2"
                                                        onError={(e) => {
                                                            if (e.target instanceof HTMLImageElement) {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/400x300?text=Document+Not+Available';
                                                            }
                                                        }}
                                                    />
                                                    <a
                                                        href={selectedExpert.proofDocument}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        Open in New Tab
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">No proof document provided</p>
                                        </div>
                                    )}
                                </div>

                                {/* Aadhar/PAN Document Section */}
                                {selectedExpert.adharPanDocument && (
                                    <div>
                                        <h4 className="font-semibold text-lg mb-4">ID Verification Document</h4>
                                        <div className="border p-4 rounded-lg">
                                            {selectedExpert.adharPanDocument.includes('.pdf') ? (
                                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded">
                                                    <FaIdCard className="text-4xl text-blue-500 mb-2" />
                                                    <p className="text-gray-700 mb-2">ID Document (PDF)</p>
                                                    <a
                                                        href={selectedExpert.adharPanDocument}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <img
                                                        src={selectedExpert.adharPanDocument}
                                                        alt="ID Document"
                                                        className="max-w-full h-auto rounded-lg shadow-md mb-2"
                                                        onError={(e) => {
                                                            if (e.target instanceof HTMLImageElement) {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/400x300?text=Document+Not+Available';
                                                            }
                                                        }}
                                                    />
                                                    <a
                                                        href={selectedExpert.adharPanDocument}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        Open in New Tab
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Expert ID: <span className="font-mono text-xs">{selectedExpert._id}</span>
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    {!selectedExpert.verified ? (
                                        <button
                                            onClick={() => handleUpdateVerification(selectedExpert._id, true)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2"
                                        >
                                            <FaCheck /> Confirm Verification
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpdateVerification(selectedExpert._id, false)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded flex items-center gap-2"
                                        >
                                            <FaTimes /> Set as Pending
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard; 