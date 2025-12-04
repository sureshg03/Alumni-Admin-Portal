import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const ManageDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch departments from the backend
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/get-departments/', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Fetched departments:', response.data);
        // Filter out invalid departments
        const validDepartments = response.data.filter(
          dept => dept.department_id && typeof dept.department_id === 'string' && dept.department_id !== 'undefined'
        );
        setDepartments(validDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setErrorMessage('Failed to fetch departments. Please try again.');
      }
    };

    fetchDepartments();
  }, []);

  const handleViewDegrees = (departmentId) => {
    console.log('handleViewDegrees called with departmentId:', departmentId);
    if (!departmentId || typeof departmentId !== 'string' || departmentId === 'undefined') {
      console.error('Invalid departmentId:', departmentId);
      setErrorMessage('Invalid department ID. Please try another department.');
      return;
    }
    navigate(`/view-degrees/${departmentId}`);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-gray-50 to-purple-100 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50/90 to-indigo-100/90 md:rounded-tl-3xl overflow-y-auto max-h-screen relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2280%22 height%3D%2280%22 viewBox%3D%220 0 80 80%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23c084fc%22 fill-opacity%3D%220.1%22%3E%3Cpath d%3D%22M50 50c0-5.52-4.48-10-10-10s-10 4.48-10 10 4.48 10 10 10 10-4.48 10-10zm-30-30c0-5.52-4.48-10-10-10S0 14.48 0 20s4.48 10 10 10 10-4.48 10-10zm60 0c0-5.52-4.48-10-10-10s-10 4.48-10 10 4.48 10 10 10 10-4.48 10-10zm-30 30c0-5.52-4.48-10-10-10s-10 4.48-10 10 4.48 10 10 10 10-4.48 10-10z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-10 pointer-events-none"></div>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">
            Explore Departments
          </h1>
        </div>

        {errorMessage && (
          <div className="bg-red-600/95 text-white px-6 py-4 rounded-xl mb-8 backdrop-blur-sm shadow-lg relative z-10">
            {errorMessage}
          </div>
        )}

        {departments.length === 0 ? (
          <div className="text-center text-gray-700 text-lg sm:text-xl font-medium bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-200/30 relative z-10">
            No departments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
            {departments.map((dept) => (
              <div
                key={dept.department_id}
                className="relative bg-white/20 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-lg border border-indigo-200/30 hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:-translate-y-1 hover:bg-white/30 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-60 rounded-3xl transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm group-hover:scale-105 transition-transform duration-300">
                  ID: {dept.department_id}
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-900 mb-4 pr-12 sm:pr-16 tracking-tight group-hover:text-indigo-800 transition-colors duration-300">
                  {dept.department_name}
                </h3>
                <p className="text-gray-700 mb-6 flex items-center text-sm sm:text-base break-all relative z-10 group-hover:text-gray-900 transition-colors duration-300">
                  <span className="mr-2 text-indigo-600 text-lg">📧</span> {dept.email}
                </p>
                <div className="flex justify-center relative z-10">
                  <button
                    onClick={() => handleViewDegrees(dept.department_id)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-sm sm:text-base shadow-md hover:shadow-[0_0_12px_rgba(79,70,229,0.5)] hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                    aria-label={`View degrees for ${dept.department_name}`}
                  >
                    View Degrees
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageDepartment;