import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { XMarkIcon, MagnifyingGlassIcon, UserIcon, EnvelopeIcon, IdentificationIcon, BriefcaseIcon, MapPinIcon, ArrowPathIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Chart from 'chart.js/auto';

const ViewStudents = () => {
  const { degreeId } = useParams();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    regno: '',
    email: '',
    role: '',
    company_name: '',
    location: '',
    status: 'all', // Default to show all students
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentChart, setCurrentChart] = useState(0);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch students when degreeId changes
  useEffect(() => {
    console.log('Fetching students for degreeId:', degreeId);
    if (!degreeId || isNaN(degreeId)) {
      console.error('Invalid degreeId:', degreeId);
      setErrorMessage('Invalid degree ID.');
      return;
    }

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/students/${degreeId}/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Students for degree', degreeId, ':', response.data);
        
        setStudents(response.data);
        setFilteredStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        setErrorMessage(`Failed to fetch students for degree ID ${degreeId}: ${error.message}`);
      }
    };

    fetchStudents();
  }, [degreeId]);

  // Apply filters whenever filters or students change
  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      student.regno.toLowerCase().includes(filters.regno.toLowerCase()) &&
      student.email.toLowerCase().includes(filters.email.toLowerCase()) &&
      (filters.role ? (student.role || '').toLowerCase().includes(filters.role.toLowerCase()) : true) &&
      (filters.company_name ? (student.company_name || '').toLowerCase().includes(filters.company_name.toLowerCase()) : true) &&
      (filters.location ? (student.location || '').toLowerCase().includes(filters.location.toLowerCase()) : true) &&
      (filters.status === 'all' || (filters.status === 'active' && student.is_active) || (filters.status === 'inactive' && !student.is_active))
    );
    setFilteredStudents(filtered);
  }, [filters, students]);

  // Initialize chart for analytics
  const initializeChart = (data, type, label, title, colors) => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      chartRef.current = new Chart(ctx, {
        type,
        data: {
          labels: data.labels,
          datasets: [{
            label,
            data: data.datasets[0].data,
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          animation: {
            duration: 1000,
            easing: 'easeInOutQuad',
          },
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: title, font: { size: 16 } },
          },
        },
      });
    }
  };

  // Update chart when analytics is toggled or chart type changes
  useEffect(() => {
    if (showAnalytics && canvasRef.current) {
      const charts = [
        {
          type: 'pie',
          getData: () => {
            const jobStatusData = {
              employed: selectedStudent ? (selectedStudent.role ? 1 : 0) : filteredStudents.filter(s => s.role).length,
              unemployed: selectedStudent ? (selectedStudent.role ? 0 : 1) : filteredStudents.filter(s => !s.role).length,
            };
            return {
              labels: ['Employed', 'Unemployed'],
              datasets: [{ data: [jobStatusData.employed, jobStatusData.unemployed] }],
            };
          },
          label: 'Job Status',
          title: 'Job Status Distribution',
          colors: { background: ['#4f46e5', '#e5e7eb'], border: ['#3730a3', '#d1d5db'] },
        },
        {
          type: 'doughnut',
          getData: () => {
            if (selectedStudent) {
              return {
                labels: ['Active', 'Inactive'],
                datasets: [{ data: [selectedStudent.is_active ? 1 : 0, selectedStudent.is_active ? 0 : 1] }],
              };
            }
            const activeCount = filteredStudents.filter(s => s.is_active).length;
            const inactiveCount = filteredStudents.filter(s => !s.is_active).length;
            return {
              labels: ['Active', 'Inactive'],
              datasets: [{ data: [activeCount, inactiveCount] }],
            };
          },
          label: 'Student Count',
          title: selectedStudent ? 'Status of Selected Student' : 'Active vs Inactive Students',
          colors: { background: ['#22c55e', '#ef4444'], border: ['#16a34a', '#dc2626'] },
        },
        {
          type: 'bar',
          getData: () => {
            if (selectedStudent) {
              return {
                labels: [selectedStudent.end_year || 'Unknown'],
                datasets: [{ data: [1] }],
              };
            }
            const years = filteredStudents.map(s => s.end_year).filter(y => y);
            const yearCounts = {};
            years.forEach(year => {
              yearCounts[year] = (yearCounts[year] || 0) + 1;
            });
            const yearLabels = Object.keys(yearCounts).sort();
            return {
              labels: yearLabels,
              datasets: [{ data: yearLabels.map(year => yearCounts[year]) }],
            };
          },
          label: 'Students',
          title: selectedStudent ? 'Graduation Year of Selected Student' : 'Graduation Year Distribution',
          colors: { background: '#ec4899', border: '#db2777' },
        },
      ];

      const current = charts[currentChart];
      initializeChart(current.getData(), current.type, current.label, current.title, current.colors);
    }
  }, [showAnalytics, currentChart, filteredStudents, selectedStudent]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      name: '',
      regno: '',
      email: '',
      role: '',
      company_name: '',
      location: '',
      status: 'all',
    });
  };

  // Open modal with student details
  const openModal = (student) => {
    setSelectedStudent(student);
  };

  // Close modal
  const closeModal = () => {
    setSelectedStudent(null);
  };

  // Toggle analytics visibility
  const toggleAnalytics = () => {
    setShowAnalytics(prev => !prev);
    setCurrentChart(0);
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  };

  // Switch to next chart
  const switchChart = () => {
    setCurrentChart(prev => (prev + 1) % 3);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50 bg-opacity-90 md:rounded-tl-3xl overflow-y-auto max-h-screen relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2280%22 height%3D%2280%22 viewBox%3D%220 0 80 80%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23a5b4fc%22 fill-opacity%3D%220.3%22%3E%3Cpath d%3D%22M40 48a8 8 0 100-16 8 8 0 000 16zm0 16a8 8 0 100-16 8 8 0 000 16zM8 48a8 8 0 100-16 8 8 0 000 16zm64 0a8 8 0 100-16 8 8 0 000 16z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pt-12 md:pt-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-900 tracking-tight drop-shadow-md flex items-center gap-3">
              <UserIcon className="h-9 w-9 text-indigo-600 animate-pulse" />
              Students for Degree ID {degreeId}
            </h1>
            <button
              onClick={toggleAnalytics}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg flex items-center gap-2 transform hover:scale-105"
            >
              {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
          <div className="bg-white/95 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-xl mb-6 border-2 border-purple-500 transition-all duration-200 relative z-10">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-900 flex items-center mb-4 drop-shadow-sm">
              <MagnifyingGlassIcon className="mr-2 h-6 w-6 text-purple-500" /> Filter Students
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'name', label: 'Name', placeholder: 'Filter by Name', icon: UserIcon },
                { name: 'regno', label: 'Registration No', placeholder: 'Filter by Reg No', icon: IdentificationIcon },
                { name: 'email', label: 'Email', placeholder: 'Filter by Email', icon: EnvelopeIcon },
                { name: 'role', label: 'Job Title', placeholder: 'Filter by Job Title', icon: BriefcaseIcon },
                { name: 'company_name', label: 'Company', placeholder: 'Filter by Company', icon: BuildingOfficeIcon },
                { name: 'location', label: 'Location', placeholder: 'Filter by Location', icon: MapPinIcon },
              ].map(({ name, label, placeholder, icon: Icon }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                    <input
                      type="text"
                      name={name}
                      value={filters[name]}
                      onChange={handleFilterChange}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-3 py-2 border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                      aria-label={placeholder}
                    />
                  </div>
                </div>
              ))}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full py-2 px-3 border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 transition-all duration-200 text-sm sm:text-base"
                  aria-label="Filter by Status"
                >
                  <option value="all">All Students</option>
                  <option value="active">Currently Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-800 font-medium transition-all duration-200 text-sm sm:text-base flex items-center gap-2"
                  aria-label="Clear all filters"
                >
                  <ArrowPathIcon className="h-5 w-5" /> Clear Filters
                </button>
              </div>
            </div>
          </div>
          {errorMessage && (
            <div className="bg-red-500/90 text-white px-5 py-3 rounded-xl mb-6 backdrop-blur-md animate-pulse shadow-lg border border-red-400">
              {errorMessage}
            </div>
          )}
          <div className={`flex ${showAnalytics ? 'flex-col lg:flex-row gap-6' : ''}`}>
            <div className={`${showAnalytics ? 'lg:w-1/2' : 'w-full'} transition-all duration-500`}>
              {filteredStudents.length === 0 ? (
                <div className="text-center text-gray-600 text-lg font-medium bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl border-2 border-purple-300 animate-fade-in">
                  No students available.
                </div>
              ) : (
                <div className="relative bg-white/90 p-4 sm:p-6 rounded-2xl shadow-2xl border-2 border-purple-400 bg-gradient-to-br from-white/70 to-purple-100/70 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-indigo-400/30 opacity-60"></div>
                  <div className="overflow-x-auto relative z-10">
                    <table className="min-w-full rounded-lg">
                      <thead>
                        <tr className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Reg No</th>
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Name</th>
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Email</th>
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Contact</th>
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Graduation</th>
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Job Title</th>
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Company</th>
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Location</th>
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Status</th>
                          <th className="py-3 px-4 text-left font-semibold text-sm sm:text-base">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr
                            key={student.regno}
                            className={`border-t border-purple-400/50 hover:bg-purple-100/50 transition-all duration-300 animate-slide-in ${selectedStudent?.regno === student.regno ? 'bg-indigo-100/80' : ''}`}
                            onClick={() => openModal(student)}
                          >
                            <td className="py-3 px-4 text-gray-800 text-sm sm:text-base">{student.regno}</td>
                            <td className="py-3 px-4 text-gray-800 text-sm sm:text-base">{student.name}</td>
                            <td className="py-3 px-4 text-gray-800 text-sm sm:text-base">{student.email}</td>
                            <td className="py-3 px-4 text-gray-800 text-sm sm:text-base">{student.phone}</td>
                            <td className="py-3 px-4 text-gray-800 text-sm sm:text-base">{student.end_year || '-'}</td>
                            <td className="py-3 px-4 text-gray-800 text-sm sm:text-base">{student.role || '-'}</td>
                            <td className="py-3 px-4 text-gray-800 text-sm sm:text-base">{student.company_name || '-'}</td>
                            <td className="py-3 px-4 text-gray-800 text-sm sm:text-base">{student.location || '-'}</td>
                            <td className="py-3 px-4 text-gray-800 text-sm sm:text-base">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                                  student.is_active
                                    ? 'bg-green-100 text-green-800 border border-green-300 animate-pulse'
                                    : 'bg-red-100 text-red-800 border border-red-300'
                                }`}
                              >
                                {student.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={(e) => { e.stopPropagation(); openModal(student); }}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all duration-300 text-sm font-medium shadow-md transform hover:scale-105"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            {showAnalytics && (
              <div className="lg:w-1/2 bg-white/95 p-6 rounded-2xl shadow-2xl border-2 border-indigo-300 animate-slide-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-indigo-900">Student Analytics</h2>
                  <button
                    onClick={switchChart}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md flex items-center gap-2 transform hover:scale-105"
                  >
                    Next Chart
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
                <div className="relative bg-gradient-to-br from-white/80 to-indigo-100/80 p-4 rounded-xl shadow-lg border border-indigo-200">
                  <canvas ref={canvasRef} className="max-h-80"></canvas>
                </div>
              </div>
            )}
          </div>
          {selectedStudent && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md">
              <div className="bg-white/95 p-4 sm:p-6 rounded-2xl max-w-md w-full shadow-2xl border-2 border-indigo-400 animate-scale-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-indigo-900 flex items-center gap-2">
                    <UserIcon className="h-6 w-6 text-indigo-600" />
                    Student Details
                  </h2>
                  <button onClick={closeModal} className="text-gray-600 hover:text-gray-800 transform hover:scale-110 transition-transform duration-200">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-2 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-4 rounded-xl border border-indigo-200 text-sm sm:text-base">
                  <p className="flex items-center gap-2">
                    <IdentificationIcon className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold">Reg No:</span> {selectedStudent.regno}
                  </p>
                  <p className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold">Name:</span> {selectedStudent.name}
                  </p>
                  <p className="flex items-center gap-2">
                    <EnvelopeIcon className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold">Email:</span> {selectedStudent.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Contact:</span> {selectedStudent.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Graduation:</span> {selectedStudent.end_year || '-'}
                  </p>
                  <p className="flex items-center gap-2">
                    <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold">Job Title:</span> {selectedStudent.role || '-'}
                  </p>
                  <p className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold">Company:</span> {selectedStudent.company_name || '-'}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold">Location:</span> {selectedStudent.location || '-'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                        selectedStudent.is_active
                          ? 'bg-green-100 text-green-800 border border-green-300 animate-pulse'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {selectedStudent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewStudents;