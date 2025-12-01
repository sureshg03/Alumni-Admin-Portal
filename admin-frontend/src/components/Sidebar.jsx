import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Building2,
  MailCheck,
  StickyNote,
  Star,
  MessageSquareMore,
  Menu,
  X,
} from "lucide-react";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // State for mobile sidebar toggle

  const menuItems = [
    { icon: <LayoutDashboard />, label: "Dashboard", path: "/dashboard" },
    { icon: <Building2 />, label: "Add Department", path: "/add-department" },
    { icon: <Building2 />, label: "Manage Department", path: "/manage-department" },
    { icon: <MailCheck />, label: "Newsletter", path: "/newsletter" },
    { icon: <StickyNote />, label: "Surveys", path: "/surveys" },
    { icon: <Star />, label: "Success Stories", path: "/success-stories" },
    { icon: <MessageSquareMore />, label: "Feedback", path: "/feedback" },
  ];

  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        await axios.post('http://localhost:8000/api/logout/', { email: userEmail }, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        localStorage.removeItem('userEmail');
        toast.success("Logged out successfully!", { position: "top-center", transition: Slide });
        setTimeout(() => {
          navigate('/login');
          setIsOpen(false); // Close sidebar on mobile after logout
        }, 2000);
      } else {
        toast.error("No user logged in!", { position: "top-center", transition: Slide });
        setTimeout(() => {
          navigate('/login');
          setIsOpen(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Logout error:", error.response?.data);
      toast.error(error.response?.data?.message || "Logout failed!", { position: "top-center", transition: Slide });
      localStorage.removeItem('userEmail');
      setTimeout(() => {
        navigate('/login');
        setIsOpen(false);
      }, 2000);
    }
  };

  return (
    <>
      {/* Toast Container */}
      <ToastContainer autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />

      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#1f003d] to-[#3f0075] text-white p-4 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:w-72 md:rounded-r-2xl h-screen font-['Poppins'] overflow-auto`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

        {/* Logo */}
        <div className="flex justify-center items-center mb-6">
          <img
            src="/Logo.png"
            alt="University Logo"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain border-4 border-purple-500 rounded-full shadow-md"
          />
        </div>

        {/* Title */}
        <div className="w-full text-center">
          <h2
            className="text-xl sm:text-2xl font-bold text-purple-200 mb-6 tracking-wider drop-shadow"
            style={{ fontFamily: "'Oleo Script Swash Caps', cursive" }}
          >
            Admin Panel
          </h2>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false); // Close sidebar on mobile after navigation
              }}
              className={`flex items-center gap-4 px-4 py-2 text-sm sm:text-base font-medium rounded-md cursor-pointer group transition-all duration-300 ${
                location.pathname === item.path
                  ? "bg-purple-600 bg-opacity-90 shadow-lg text-white"
                  : "hover:bg-purple-500 hover:bg-opacity-80 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)] text-purple-200"
              }`}
              role="button"
              aria-current={location.pathname === item.path ? "page" : undefined}
            >
              <span className="text-lg sm:text-xl text-yellow-300 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="group-hover:text-white">{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-2 mt-4 text-sm sm:text-base font-medium rounded-md cursor-pointer group hover:bg-red-500 hover:bg-opacity-80 hover:shadow-[0_0_10px_rgba(239,68,68,0.4)] text-red-300 hover:text-white transition-all duration-300"
          role="button"
        >
          <LogOut className="text-lg sm:text-xl group-hover:scale-110 transition-transform" />
          <span>Logout</span>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default React.memo(Sidebar); // Memoize to prevent unnecessary re-renders