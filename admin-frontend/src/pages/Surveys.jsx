import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiX, FiRefreshCw, FiClock, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

// Configure Axios base URL to point to Django backend
axios.defaults.baseURL = '/api'; // Use relative path for Nginx proxy
axios.defaults.withCredentials = true; // Ensure cookies (like CSRF) are sent with requests

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const Surveys = () => {
  const [activePolls, setActivePolls] = useState([]);
  const [pastPolls, setPastPolls] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [moveToPastModal, setMoveToPastModal] = useState({ open: false, pollId: null });
  const [formData, setFormData] = useState({
    question: '',
    deadline: '',
    options: ['', '']
  });
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [chartType, setChartType] = useState({});
  const [showChart, setShowChart] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!userEmail) {
      toast.error('Please log in to access this page');
      navigate('/login');
    }
  }, [userEmail, navigate]);

  const fetchPolls = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/polls/');
      setActivePolls(response.data.active_polls || []);
      setPastPolls(response.data.past_polls || []);
    } catch (error) {
      toast.error('Failed to load polls: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchPolls();
    }
  }, [fetchPolls, userEmail]);

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

  const handleChange = (e, index) => {
    if (e.target.name.startsWith('option')) {
      const newOptions = [...formData.options];
      newOptions[index] = e.target.value;
      setFormData(prev => ({ ...prev, options: newOptions }));
    } else {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
    } else {
      toast.error('Maximum 10 options allowed');
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    } else {
      toast.error('At least two options are required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.options.some(opt => opt.trim() === '')) {
      toast.error('Please provide valid options for the poll');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        question: formData.question,
        deadline: new Date(formData.deadline).toISOString(),
        options: formData.options.filter(opt => opt.trim() !== ''),
        email: userEmail
      };
      let response;
      if (isEditing) {
        response = await axios.put(`/api/polls/${editId}/`, payload, {
          headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        toast.success('Poll updated successfully!');
      } else {
        response = await axios.post('/api/polls/', payload, {
          headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        toast.success('Poll created successfully!');
      }
      setIsModalOpen(false);
      setFormData({ question: '', deadline: '', options: ['', ''] });
      setIsEditing(false);
      setEditId(null);
      fetchPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save poll');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (poll) => {
    setFormData({
      question: poll.question,
      deadline: new Date(poll.deadline).toISOString().slice(0, 16),
      options: poll.options.map(opt => opt.text)
    });
    setEditId(poll.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (pollId) => {
    setDeleteType('single');
    setDeleteId(pollId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAll = () => {
    setDeleteType('all');
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      if (deleteType === 'single') {
        await axios.delete(`/api/polls/${deleteId}/delete/`, {
          headers: { 'X-CSRFToken': getCookie('csrftoken') },
          data: { email: userEmail }
        });
        toast.success('Poll deleted successfully!');
      } else {
        await axios.delete('/api/polls/delete-all/', {
          headers: { 'X-CSRFToken': getCookie('csrftoken') },
          data: { email: userEmail }
        });
        toast.success('All polls deleted successfully!');
      }
      fetchPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete polls');
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteType(null);
      setDeleteId(null);
    }
  };

  const handleMoveToPast = (pollId) => {
    setMoveToPastModal({ open: true, pollId });
  };

  const confirmMoveToPast = async () => {
    setIsLoading(true);
    try {
      await axios.post(`/api/polls/${moveToPastModal.pollId}/move-to-past/`, {
        email: userEmail
      }, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      toast.success('Poll moved to past polls!');
      fetchPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move poll');
    } finally {
      setIsLoading(false);
      setMoveToPastModal({ open: false, pollId: null });
    }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      await axios.post(`/api/polls/${pollId}/vote/`, {
        poll_option: optionId,
        email: userEmail
      }, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      toast.success('Vote recorded!');
      fetchPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record vote');
    }
  };

  const toggleChartType = (pollId) => {
    setShowChart(prev => ({ ...prev, [pollId]: true }));
    setChartType(prev => ({
      ...prev,
      [pollId]: prev[pollId] === 'pie' ? 'bar' : prev[pollId] === 'bar' ? 'line' : 'pie'
    }));
  };

  const renderPollCard = (poll, isPast = false) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0);
    const chartData = {
      labels: poll.options.map(opt => opt.text),
      datasets: [{
        label: 'Votes',
        data: poll.options.map(opt => opt.vote_count),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
        borderColor: ['#2563eb', '#7c3aed', '#db2777', '#059669'],
        borderWidth: 1,
        fill: chartType[poll.id] === 'line' ? false : true,
        tension: chartType[poll.id] === 'line' ? 0.4 : undefined
      }]
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12, family: 'Inter' } } },
        tooltip: { enabled: true }
      },
      maintainAspectRatio: false
    };

    const barOptions = {
      ...chartOptions,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Votes', font: { family: 'Inter' } } },
        x: { title: { display: true, text: 'Options', font: { family: 'Inter' } } }
      }
    };

    const lineOptions = {
      ...chartOptions,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Votes', font: { family: 'Inter' } } },
        x: { title: { display: true, text: 'Options', font: { family: 'Inter' } } }
      }
    };

    return (
      <div
        key={poll.id}
        className={`relative bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-200/50 hover:shadow-[0_12px_40px_rgba(99,102,241,0.3)] transition-all duration-300 w-full mx-auto ${
          showChart[poll.id] ? 'min-w-[24rem] max-w-4xl' : 'min-w-[20rem] max-w-2xl'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl opacity-80"></div>
        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight break-words pr-4">{poll.question}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <FiClock className="mr-2 text-indigo-600" />
              Deadline: {new Date(poll.deadline).toLocaleString()}
            </div>
          </div>
          <div className={`grid ${poll.options.length > 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {poll.options.map((option, index) => (
              <div
                key={option.id}
                className={`relative p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  ['bg-blue-100/90', 'bg-purple-100/90', 'bg-pink-100/90', 'bg-green-100/90'][index % 4]
                } border border-gray-200/50`}
                onClick={() => !isPast && !poll.is_expired && handleVote(poll.id, option.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-xl opacity-60"></div>
                <div className="relative z-10">
                  <p className="text-sm font-medium text-gray-700 mb-1 line-clamp-2">{option.text}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalVotes > 0 ? ((option.vote_count / totalVotes) * 100).toFixed(1) : 0}%
                    <span className="text-sm font-normal text-gray-600"> ({option.vote_count} votes)</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          {showChart[poll.id] && (
            <div className="min-h-[20rem] animate-fade-in">
              {chartType[poll.id] === 'bar' ? (
                <Bar data={chartData} options={barOptions} />
              ) : chartType[poll.id] === 'line' ? (
                <Line data={chartData} options={lineOptions} />
              ) : (
                <Pie data={chartData} options={chartOptions} />
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => toggleChartType(poll.id)}
              className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:ring-2 hover:ring-indigo-400 text-sm font-medium min-w-[120px]"
            >
              {chartType[poll.id] === 'bar' ? (
                <FiTrendingUp className="mr-2" />
              ) : chartType[poll.id] === 'line' ? (
                <FiPieChart className="mr-2" />
              ) : (
                <FiBarChart2 className="mr-2" />
              )}
              Switch to {chartType[poll.id] === 'bar' ? 'Line' : chartType[poll.id] === 'line' ? 'Pie' : 'Bar'}
            </button>
            <div className="flex flex-wrap gap-3">
              {!isPast && !poll.is_expired && (
                <button
                  onClick={() => handleEdit(poll)}
                  className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-all duration-200 shadow-md hover:ring-2 hover:ring-indigo-400 text-sm font-medium min-w-[100px]"
                  disabled={isLoading}
                >
                  <FiEdit className="mr-2" /> Edit
                </button>
              )}
              <button
                onClick={() => handleDelete(poll.id)}
                className="flex items-center bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all duration-200 shadow-md hover:ring-2 hover:ring-red-400 text-sm font-medium min-w-[100px]"
                disabled={isLoading}
              >
                <FiTrash2 className="mr-2" /> Delete
              </button>
              {poll.is_expired && !isPast && (
                <button
                  onClick={() => handleMoveToPast(poll.id)}
                  className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition-all duration-200 shadow-md hover:ring-2 hover:ring-purple-400 text-sm font-medium min-w-[120px]"
                  disabled={isLoading}
                >
                  <FiBarChart2 className="mr-2" /> Move to Past
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 bg-gray-50/95 md:rounded-tl-3xl overflow-y-auto max-h-screen relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2280%22 height%3D%2280%22 viewBox%3D%220 0 80 80%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23a5b4fc%22 fill-opacity%3D%220.3%22%3E%3Cpath d%3D%22M40 48a8 8 0 100-16 8 8 0 000 16zm0 16a8 8 0 100-16 8 8 0 000 16zM8 48a8 8 0 100-16 8 8 0 000 16zm64 0a8 8 0 100-16 8 8 0 000 16z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20 pointer-events-none"></div>
        <Toaster position="top-right" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pt-12 md:pt-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-900 tracking-tight drop-shadow-md flex items-center gap-3">
              <FiBarChart2 className="h-10 w-10 text-indigo-600 animate-pulse" />
              Surveys & Polls
            </h1>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setFormData({ question: '', deadline: '', options: ['', ''] });
                  setIsEditing(false);
                  setIsModalOpen(true);
                }}
                className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:ring-2 hover:ring-indigo-400 text-sm font-medium min-w-[120px]"
                disabled={isLoading}
              >
                <FiPlus className="mr-2" /> Create Poll
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex items-center bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-full hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:ring-2 hover:ring-red-400 text-sm font-medium min-w-[120px]"
                disabled={isLoading || (activePolls.length === 0 && pastPolls.length === 0)}
              >
                <FiTrash2 className="mr-2" /> Delete All
              </button>
              <button
                onClick={fetchPolls}
                style={{ background: 'linear-gradient(to right, #16a34a, #059669)' }}
                className="flex items-center text-white px-5 py-2.5 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg hover:ring-2 hover:ring-green-400 text-sm font-medium min-w-[120px]"
                disabled={isLoading}
              >
                <FiRefreshCw className="mr-2" /> Refresh
              </button>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-4">Active Polls</h2>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-r-transparent"></div>
                </div>
              ) : activePolls.length === 0 ? (
                <div className="text-center text-gray-600 text-lg bg-white/95 backdrop-blur-lg p-6 rounded-2xl shadow-xl border-2 border-purple-400 max-w-2xl mx-auto">
                  No active polls. Create a new poll to engage alumni and students!
                </div>
              ) : (
                <div className={`grid gap-6 ${activePolls.some(poll => showChart[poll.id]) ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {activePolls.map(poll => renderPollCard(poll))}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-4">Past Polls</h2>
              {pastPolls.length === 0 ? (
                <div className="text-center text-gray-600 text-lg bg-white/95 backdrop-blur-lg p-6 rounded-2xl shadow-xl border-2 border-purple-400 max-w-2xl mx-auto">
                  No past polls available.
                </div>
              ) : (
                <div className={`grid gap-6 ${pastPolls.some(poll => showChart[poll.id]) ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {pastPolls.map(poll => renderPollCard(poll, true))}
                </div>
              )}
            </div>
          </div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md sm:max-w-lg mx-4 border-2 border-purple-500 transform transition-all duration-300 animate-slide-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-900 tracking-tight drop-shadow-sm">
                  {isEditing ? 'Edit Poll' : 'Create New Poll'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:ring-2 hover:ring-purple-400 rounded-full"
                  disabled={isLoading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    name="question"
                    placeholder="Enter poll question"
                    value={formData.question}
                    onChange={handleChange}
                    className="w-full border border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    name="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full border border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (at least 2 required)</label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        name={`option-${index}`}
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleChange(e, index)}
                        className="w-full border border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                        required
                        disabled={isLoading}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700 transition-all duration-200"
                          disabled={isLoading}
                        >
                          <FiX size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-purple-600 hover:text-purple-800 font-medium mt-2 transition-all duration-200"
                    disabled={isLoading || formData.options.length >= 10}
                  >
                    + Add Option
                  </button>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md hover:ring-2 hover:ring-gray-400 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-indigo-800 hover:to-purple-800 transition-all duration-200 shadow-md hover:ring-2 hover:ring-purple-400 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : isEditing ? 'Update Poll' : 'Create Poll'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md mx-4 border-2 border-red-400 transform transition-all duration-300 animate-slide-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-red-900 tracking-tight drop-shadow-sm">
                  {deleteType === 'single' ? 'Delete Poll' : 'Delete All Polls'}
                </h2>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:ring-2 hover:ring-red-400 rounded-full"
                  disabled={isLoading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-gray-700 mb-6 text-sm sm:text-base">
                Are you sure you want to delete {deleteType === 'single' ? 'this poll' : 'all polls'}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md hover:ring-2 hover:ring-gray-400 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:ring-2 hover:ring-red-400 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        {moveToPastModal.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md mx-4 border-2 border-purple-500 transform transition-all duration-300 animate-slide-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-900 tracking-tight drop-shadow-sm">
                  Move to Past Polls
                </h2>
                <button
                  onClick={() => setMoveToPastModal({ open: false, pollId: null })}
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:ring-2 hover:ring-purple-400 rounded-full"
                  disabled={isLoading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-gray-700 mb-6 text-sm sm:text-base">
                This poll has reached its deadline. Would you like to move it to the Past Polls section?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setMoveToPastModal({ open: false, pollId: null })}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md hover:ring-2 hover:ring-gray-400 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMoveToPast}
                  className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-indigo-800 hover:to-purple-800 transition-all duration-200 shadow-md hover:ring-2 hover:ring-purple-400 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Moving...' : 'Move to Past'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Surveys;