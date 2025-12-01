import React from "react";

const DashboardCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-purple-700 hover:shadow-lg transition-all">
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    <p className="text-2xl font-bold text-purple-700">{value}</p>
  </div>
);

export default DashboardCard;