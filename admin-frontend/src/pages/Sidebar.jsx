import React from "react";
import {
  FiLogOut,
} from "react-icons/fi";
import {
  FaTachometerAlt,
  FaBuilding,
  FaEnvelope,
  FaPoll,
  FaStar,
} from "react-icons/fa";

const Sidebar = ({ setActivePage, activePage }) => {
  const menuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", page: "dashboard" },
    { icon: <FaBuilding />, label: "Add Department", page: "add-department" },
    { icon: <FaBuilding />, label: "Manage Department", page: "manage-department" },
    { icon: <FaEnvelope />, label: "Newsletter", page: "newsletter" },
    { icon: <FaPoll />, label: "Surveys", page: "surveys" },
    { icon: <FaStar />, label: "Success Stories", page: "success-stories" },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white h-screen p-6 flex flex-col shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-10 tracking-tight">Admin Panel</h2>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.page}
            onClick={() => setActivePage(item.page)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
              activePage === item.page ? "bg-indigo-700" : "hover:bg-indigo-700"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-lg font-semibold">{item.label}</span>
          </div>
        ))}
      </nav>
      <div
        onClick={() => setActivePage("logout")}
        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all cursor-pointer"
      >
        <span className="text-2xl"><FiLogOut /></span>
        <span className="text-lg font-semibold">Logout</span>
      </div>
    </aside>
  );
};

export default Sidebar;