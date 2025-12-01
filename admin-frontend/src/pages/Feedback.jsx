import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { Star, Filter, SortAsc, SortDesc, Flag, Trash2, Eye, EyeOff, Search, X, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Tooltip } from 'react-tooltip';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Configure Axios for CSRF
axios.defaults.withCredentials = true;

const Feedback = () => {
  console.log('Feedback: Rendering Admin Feedback Section');

  // State management
  const [feedback, setFeedback] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterRating, setFilterRating] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Feedback categories with vibrant colors
  const categories = [
    { id: 'All', name: 'All Categories', color: 'bg-gradient-to-r from-gray-700 to-gray-800' },
    { id: 'General Feedback', name: 'General Feedback', color: 'bg-gradient-to-r from-blue-600 to-indigo-600' },
    { id: 'Events & Programs', name: 'Events & Programs', color: 'bg-gradient-to-r from-green-600 to-teal-600' },
    { id: 'Platform Experience', name: 'Platform Experience', color: 'bg-gradient-to-r from-orange-600 to-red-600' },
    { id: 'Mentorship', name: 'Mentorship', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  ];

  // Fetch feedbacks from API
  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/feedbacks/', {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      console.log('Feedbacks fetched:', response.data);
      setFeedback(response.data || []);
    } catch (error) {
      console.error('Fetch feedbacks error:', error.response || error.message);
      if (error.response?.status === 401) {
        window.location.href = '/admin/login';
      }
      toast.error('Failed to load feedbacks: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch CSRF token before fetching feedbacks
    axios.get('/api/get-csrf-token/').then(() => {
      fetchFeedbacks();
    }).catch((error) => {
      console.error('CSRF token fetch error:', error);
      toast.error('Failed to initialize CSRF token');
    });
  }, [fetchFeedbacks]);

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Filter and sort feedback
  const filteredFeedback = feedback
    .filter((item) => filterCategory === 'All' || item.category === filterCategory)
    .filter((item) => filterRating === 'All' || item.rating === parseInt(filterRating))
    .filter((item) =>
      searchQuery
        ? item.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.department_name && item.department_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.degree_name && item.degree_name.toLowerCase().includes(searchQuery.toLowerCase()))
        : true
    )
    .sort((a, b) => {
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'rating-asc') return a.rating - b.rating;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      return 0;
    });

  // Handle feedback actions
  const toggleRead = async (id) => {
    try {
      const item = feedback.find((item) => item.id === id);
      await axios.put(`/api/feedbacks/${id}/`, { is_read: !item.is_read }, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: !item.is_read } : item
        )
      );
    } catch (error) {
      console.error('Toggle read error:', error);
      toast.error('Failed to update read status');
    }
  };

  const toggleFlag = async (id) => {
    try {
      const item = feedback.find((item) => item.id === id);
      await axios.put(`/api/feedbacks/${id}/`, { is_flagged: !item.is_flagged }, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_flagged: !item.is_flagged } : item
        )
      );
    } catch (error) {
      console.error('Toggle flag error:', error);
      toast.error('Failed to update flag status');
    }
  };

  const deleteFeedback = async (id) => {
    try {
      await axios.delete(`/api/feedbacks/${id}/delete/`, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      setFeedback((prev) => prev.filter((item) => item.id !== id));
      if (selectedFeedback?.id === id) setSelectedFeedback(null);
      toast.success('Feedback deleted successfully!');
    } catch (error) {
      console.error('Delete feedback error:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const bulkMarkRead = async () => {
    try {
      await axios.post('/api/feedbacks/bulk-read/', { ids: selectedIds }, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      setFeedback((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, is_read: true } : item
        )
      );
      setSelectedIds([]);
      toast.success('Selected feedbacks marked as read!');
    } catch (error) {
      console.error('Bulk mark read error:', error);
      toast.error('Failed to mark feedbacks as read');
    }
  };

  const bulkDelete = async () => {
    try {
      await axios.post('/api/feedbacks/bulk-delete/', { ids: selectedIds }, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      setFeedback((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      if (selectedIds.includes(selectedFeedback?.id)) setSelectedFeedback(null);
      toast.success('Selected feedbacks deleted!');
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete selected feedbacks');
    }
  };

  // Sentiment indicator
  const getSentiment = (rating) => {
    if (rating >= 4) return { text: 'Positive', color: 'text-green-500' };
    if (rating === 3) return { text: 'Neutral', color: 'text-yellow-500' };
    return { text: 'Negative', color: 'text-red-500' };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-white via-gray-100 to-gray-200 text-gray-800">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-gray-50/95 md:rounded-tl-3xl overflow-y-auto max-h-screen relative">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-gray-100 to-gray-200 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 bg-gray-50/95 md:rounded-tl-3xl overflow-y-auto max-h-screen relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 relative z-10 pt-8 md:pt-0"></div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-900 tracking-tight drop-shadow-md">
            Feedbacks and Review
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 font-medium">
            Manage and analyze alumni feedback with ease.
          </p>
        </motion.div>

        {/* Filter, Search, and Bulk Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Search Feedback
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by user, comment, department, or degree"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm sm:text-base bg-gray-50 transition-all duration-300"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Filter by Category
              </label>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm sm:text-base bg-gray-50 transition-all duration-300 appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Filter by Rating
              </label>
              <div className="relative">
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm sm:text-base bg-gray-50 transition-all duration-300 appearance-none"
                >
                  <option value="All">All Ratings</option>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} Star{star > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <Star className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm sm:text-base bg-gray-50 transition-all duration-300 appearance-none"
                >
                  <option value="date-desc">Date (Newest)</option>
                  <option value="date-asc">Date (Oldest)</option>
                  <option value="rating-desc">Rating (Highest)</option>
                  <option value="rating-asc">Rating (Lowest)</option>
                </select>
                {sortBy.includes('asc') ? (
                  <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <SortDesc className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-wrap gap-3"
            >
              <button
                onClick={bulkMarkRead}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm sm:text-base font-medium transition-all duration-300 shadow-sm"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Mark Selected as Read
              </button>
              <button
                onClick={bulkDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center text-sm sm:text-base font-medium transition-all duration-300 shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Feedback Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-7 sm:gap-7 lg:gap-15">
          <AnimatePresence>
            {filteredFeedback.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center text-gray-600 py-12 text-base sm:text-lg font-medium"
              >
                No feedback matches the current filters.
              </motion.div>
            ) : (
              filteredFeedback.map((item, index) => (
                <Tilt key={item.id} tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 min-w-[300px] max-w-md mx-auto ${
                      item.is_flagged ? 'border-l-4 border-red-500 shadow-orange-500' : ''
                    } ${selectedIds.includes(item.id) ? 'ring-2 ring-blue-400' : ''} cursor-pointer flex flex-col`}
                    onClick={() => setSelectedFeedback(item)}
                  >
                    {/* Category Badge */}
                    <div
                      className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white mb-4 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ${
                        categories.find((cat) => cat.name === item.category)?.color || 'bg-gray-700'
                      }`}
                    >
                      {item.category}
                    </div>

                    {/* Custom Checkbox */}
                    <label className="absolute top-6 right-6 flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="hidden"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span
                        className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                          selectedIds.includes(item.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedIds.includes(item.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </label>

                    {/* User Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{item.user_name}</h3>
                      <p className="text-sm text-gray-500 truncate">{item.user_email}</p>
                      <p className="text-xs text-gray-400">
                        {(item.department_name || 'Unknown Department')} - {(item.degree_name || 'Unknown Degree')}
                      </p>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>

                    {/* Rating and Sentiment */}
                    <div className="flex items-center mb-4 space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                        />
                      ))}
                      <span className={`text-sm font-medium ${getSentiment(item.rating).color}`}>
                        {getSentiment(item.rating).text}
                      </span>
                    </div>

                    {/* Comment */}
                    <p className="text-base text-gray-600 mb-4 flex-grow line-clamp-3">{item.comment}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRead(item.id);
                        }}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all duration-300 shadow-sm"
                        data-tooltip-id={`read-${item.id}`}
                        data-tooltip-content={item.is_read ? 'Mark as Unread' : 'Mark as Read'}
                      >
                        {item.is_read ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.button>
                      <Tooltip id={`read-${item.id}`} place="top" />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlag(item.id);
                        }}
                        className={`p-2 rounded-full ${
                          item.is_flagged
                            ? 'bg-red-100 hover:bg-red-200 text-red-600'
                            : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
                        } transition-all duration-300 shadow-sm`}
                        data-tooltip-id={`flag-${item.id}`}
                        data-tooltip-content={item.is_flagged ? 'Unflag' : 'Flag for Follow-up'}
                      >
                        <Flag className="w-5 h-5" />
                      </motion.button>
                      <Tooltip id={`flag-${item.id}`} place="top" />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFeedback(item.id);
                        }}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-300 shadow-sm"
                        data-tooltip-id={`delete-${item.id}`}
                        data-tooltip-content="Delete Feedback"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                      <Tooltip id={`delete-${item.id}`} place="top" />
                    </div>
                  </motion.div>
                </Tilt>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Feedback Details Modal */}
        <AnimatePresence>
          {selectedFeedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedFeedback(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Feedback Details</h2>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* User Info */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedFeedback.user_name}</h3>
                    <p className="text-sm text-gray-500 truncate">{selectedFeedback.user_email}</p>
                    <p className="text-xs text-gray-400">
                      {(selectedFeedback.department_name || 'Unknown Department')} - {(selectedFeedback.degree_name || 'Unknown Degree')}
                    </p>
                    <p className="text-xs text-gray-400">{selectedFeedback.date}</p>
                  </div>

                  {/* Category and Sentiment */}
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-md ${
                        categories.find((cat) => cat.name === selectedFeedback.category)?.color || 'bg-gray-700'
                      }`}
                    >
                      {selectedFeedback.category}
                    </span>
                    <span className={`text-sm font-medium ${getSentiment(selectedFeedback.rating).color}`}>
                      {getSentiment(selectedFeedback.rating).text}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < selectedFeedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-base text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                    {selectedFeedback.comment}
                  </p>

                  {/* Status */}
                  <div className="flex space-x-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        selectedFeedback.is_read ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {selectedFeedback.is_read ? 'Read' : 'Unread'}
                    </span>
                    {selectedFeedback.is_flagged && (
                      <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600">
                        Flagged
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleRead(selectedFeedback.id)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center text-sm font-medium transition-all duration-300 shadow-sm"
                    >
                      {selectedFeedback.is_read ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {selectedFeedback.is_read ? 'Mark Unread' : 'Mark Read'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFlag(selectedFeedback.id)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedFeedback.is_flagged
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      } text-white flex items-center text-sm font-medium transition-all duration-300 shadow-sm`}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      {selectedFeedback.is_flagged ? 'Unflag' : 'Flag'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteFeedback(selectedFeedback.id)}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center text-sm font-medium transition-all duration-300 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Feedback;