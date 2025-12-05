import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const ViewDegrees = () => {
  const { departmentId } = useParams();
  const [degrees, setDegrees] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Fetching degrees for departmentId:', departmentId);
    if (!departmentId || typeof departmentId !== 'string' || departmentId === 'undefined') {
      console.error('Invalid departmentId:', departmentId);
      setErrorMessage('Invalid department ID.');
      return;
    }

    // Fetch degrees from the backend
    const fetchDegrees = async () => {
      try {
        const response = await axios.get(`/api/degrees/${departmentId}/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Degrees for', departmentId, ':', response.data);
    //    if (response.data.length === 0) {
     //     setErrorMessage(`No degrees found for department ${departmentId}. Please ensure degrees are added in the database.`);
    //    } else {
    //      setErrorMessage(null);
    //    }
        setDegrees(response.data);
      } catch (error) {
        console.error('Error fetching degrees:', error);
        setErrorMessage(`Failed to fetch degrees for department ${departmentId}: ${error.message}`);
      }
    };

    fetchDegrees();
  }, [departmentId]);

  const handleViewStudents = (degreeId) => {
    console.log('handleViewStudents called with degreeId:', degreeId);
    if (!degreeId || typeof degreeId !== 'number') {
      console.error('Invalid degreeId:', degreeId);
      setErrorMessage('Invalid degree ID.');
      return;
    }
    navigate(`/view-students/${degreeId}`);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-gray-100 to-gray-200 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-100 bg-opacity-95 md:rounded-tl-3xl overflow-y-auto max-h-screen">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23a5b4fc%22 fill-opacity%3D%220.1%22%3E%3Cpath d%3D%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h-4v2h4v4h2v-4h4V8h-4V4h-2zM6 34v4H4v2h4v4h2v-4h4v-2h-4v-4H6zM6 4v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30 md:opacity-50 pointer-events-none"></div>
        <div className="flex flex-col items-center justify-between mb-6 gap-4 relative z-10 pt-12 md:pt-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-900 tracking-tight drop-shadow-md">
            Degrees for Department {departmentId}
          </h1>
        </div>
        {errorMessage && (
          <div className="bg-red-500/80 text-white px-4 py-3 rounded-lg mb-6 backdrop-blur-md animate-slide-in relative z-10">
            {errorMessage}
          </div>
        )}
        {degrees.length === 0 && !errorMessage && (
          <div className="text-center text-gray-600 text-base sm:text-lg font-medium bg-white/95 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-purple-400 relative z-10">
            No degrees available.
          </div>
        )}
        {degrees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
            {degrees.map((degree) => (
              <div
                key={degree.id}
                className="relative bg-glass p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-purple-500 bg-gradient-to-br from-white/80 to-purple-100/80 overflow-hidden hover:shadow-neon hover:-translate-y-2 transition-all duration-300"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-bl-lg shadow-md">
                  ID: {degree.id}
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-900 mb-3 pr-16 sm:pr-20 tracking-tight relative z-10">
                  {degree.degree_name}
                </h3>
                <p className="text-gray-700 mb-4 break-all flex items-center relative z-10 text-sm sm:text-base">
                  <span className="mr-2 text-purple-600">🕒</span> {degree.duration_years} years
                </p>
                <div className="flex justify-center relative z-10">
                  <button
                    onClick={() => handleViewStudents(degree.id)}
                    className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-neon hover:ring-2 hover:ring-purple-400 w-full sm:w-auto"
                    aria-label={`View students for ${degree.name}`}
                  >
                    View Students
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

export default ViewDegrees;