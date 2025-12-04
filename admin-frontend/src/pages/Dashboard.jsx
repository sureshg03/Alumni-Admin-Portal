import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const GlassCard = ({ title, value, color, icon }) => (
  <motion.div
    className={`glassmorphism p-6 rounded-2xl shadow-lg ${color} flex items-center space-x-4 transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-4xl">{icon}</div>
    <div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  </motion.div>
);

const DepartmentPieChart = () => {
  const [chartData, setChartData] = useState({
    labels: ["CS", "EE", "ME", "CE"],
    datasets: [{
      label: "Department-wise Students",
      data: [120, 90, 150, 80],
      backgroundColor: [
        "rgba(147, 51, 234, 0.7)",
        "rgba(59, 130, 246, 0.7)",
        "rgba(236, 72, 153, 0.7)",
        "rgba(34, 197, 94, 0.7)",
      ],
      borderColor: ["#ffffff"],
      borderWidth: 2,
      hoverOffset: 30,
    }],
  });
  const [totalDepartments, setTotalDepartments] = useState(4);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentResponse = await axios.get('/api/department-student-counts/', {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        const studentData = studentResponse.data;

        const statsResponse = await axios.get('/api/dashboard-stats/', {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        setTotalDepartments(statsResponse.data.total_departments);

        const colors = studentData.map((_, index, arr) => {
          const ctx = document.createElement("canvas").getContext("2d");
          const gradient = ctx.createLinearGradient(0, 0, 200, 200);
          const hue = (index * 360 / arr.length) % 360;
          gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`);
          gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, 70%, 60%, 0.6)`);
          return gradient;
        });
        const borderColors = studentData.map(() => "#ffffff");
        setChartData({
          labels: studentData.map(item => item.department_name),
          datasets: [{
            label: "Department-wise Students",
            data: studentData.map(item => item.student_count),
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2,
            hoverOffset: 30,
            hoverBorderWidth: 4,
            shadowOffsetX: 4,
            shadowOffsetY: 4,
            shadowBlur: 12,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          }],
        });
      } catch (error) {
        console.error("Failed to fetch department data:", error);
        setChartData({
          labels: ["CS", "EE", "ME", "CE"],
          datasets: [{
            label: "Department-wise Students",
            data: [120, 90, 150, 80],
            backgroundColor: [
              "rgba(147, 51, 234, 0.7)",
              "rgba(59, 130, 246, 0.7)",
              "rgba(236, 72, 153, 0.7)",
              "rgba(34, 197, 94, 0.7)",
            ],
            borderColor: ["#ffffff"],
            borderWidth: 2,
            hoverOffset: 30,
            hoverBorderWidth: 4,
            shadowOffsetX: 4,
            shadowOffsetY: 4,
            shadowBlur: 12,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          }],
        });
        setTotalDepartments(4);
      }
    };
    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#1f2937",
          font: { family: "'Inter', sans-serif", size: 14, weight: "bold" },
          padding: 15,
          boxWidth: 15,
          boxHeight: 15,
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label} (${data.datasets[0].data[i]})`,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: "#ffffff",
              lineWidth: 2,
              pointStyle: "circle",
              hidden: false,
              index: i,
            }));
          },
        },
      },
      title: {
        display: true,
        text: "Department-wise Student Distribution",
        color: "#1f2937",
        font: { family: "'Inter', sans-serif", size: 20, weight: "bold" },
        padding: { top: 10, bottom: 10 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 100);
          gradient.addColorStop(0, "rgba(147, 51, 234, 0.9)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.9)");
          return gradient;
        },
        titleFont: { family: "'Inter', sans-serif", size: 14, weight: "bold" },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} student${value !== 1 ? "s" : ""} (${percentage}%)`;
          },
        },
      },
      centerText: {
        id: "centerText",
        afterDraw(chart) {
          const { ctx, chartArea: { width, height } } = chart;
          ctx.save();
          ctx.font = "bold 16px 'Inter', sans-serif";
          ctx.fillStyle = "#1f2937";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const centerX = width / 2;
          const centerY = height / 2;
          ctx.fillText(`Total Depts: ${totalDepartments}`, centerX, centerY);
          ctx.restore();
        },
      },
    },
    animation: {
      duration: 2000,
      easing: "easeOutElastic",
      animateScale: true,
      animateRotate: true,
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    },
    cutout: "60%",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1, ease: "easeOut", type: "spring", stiffness: 100 }}
      className="relative bg-gradient-to-b from-white/90 to-gray-100/90 p-6 rounded-2xl shadow-xl border border-white/30"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <motion.div
        className="chart-container"
        style={{ maxWidth: "450px", margin: "0 auto" }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <Pie data={chartData} options={options} />
      </motion.div>
    </motion.div>
  );
};

const ActiveStudentsBarChart = () => {
  const [chartData, setChartData] = useState({
    labels: ["CS", "EE", "ME", "CE"],
    datasets: [{
      label: "Active Students by Department",
      data: [50, 30, 60, 20],
      backgroundColor: "rgba(34, 197, 94, 0.7)",
      borderColor: "rgba(34, 197, 94, 1)",
      borderWidth: 1,
    }],
  });

  useEffect(() => {
    const fetchActiveStudentCounts = async () => {
      try {
        const response = await axios.get('/api/active-student-counts/', {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        const data = response.data;
        const colors = data.map((_, index, arr) => {
          const ctx = document.createElement("canvas").getContext("2d");
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          const hue = (index * 360 / arr.length) % 360;
          gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.9)`);
          gradient.addColorStop(0.5, `hsla(${hue}, 80%, 50%, 0.8)`);
          gradient.addColorStop(1, `hsla(${hue}, 80%, 40%, 0.7)`);
          return gradient;
        });
        const hoverColors = data.map((_, index, arr) => {
          const ctx = document.createElement("canvas").getContext("2d");
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          const hue = (index * 360 / arr.length) % 360;
          gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, 1)`);
          gradient.addColorStop(1, `hsla(${(hue + 30) % 360}, 90%, 50%, 0.9)`);
          return gradient;
        });
        setChartData({
          labels: data.map(item => item.department_name),
          datasets: [{
            label: "Active Students by Department",
            data: data.map(item => item.active_student_count),
            backgroundColor: colors,
            borderColor: data.map((_, index, arr) => `hsla(${(index * 360 / arr.length) % 360}, 80%, 60%, 1)`),
            borderWidth: 1,
            borderRadius: 12,
            barThickness: 28,
            hoverBackgroundColor: hoverColors,
            hoverBorderWidth: 2,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            shadowBlur: 15,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          }],
        });
      } catch (error) {
        console.error("Failed to fetch active student counts:", error);
        setChartData({
          labels: ["CS", "EE", "ME", "CE"],
          datasets: [{
            label: "Active Students by Department",
            data: [50, 30, 60, 20],
            backgroundColor: [
              "rgba(34, 197, 94, 0.7)",
              "rgba(147, 51, 234, 0.7)",
              "rgba(236, 72, 153, 0.7)",
              "rgba(59, 130, 246, 0.7)",
            ],
            borderColor: [
              "rgba(34, 197, 94, 1)",
              "rgba(147, 51, 234, 1)",
              "rgba(236, 72, 153, 1)",
              "rgba(59, 130, 246, 1)",
            ],
            borderWidth: 1,
            borderRadius: 12,
            barThickness: 28,
            hoverBorderWidth: 2,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            shadowBlur: 15,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          }],
        });
      }
    };
    fetchActiveStudentCounts();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#1f2937",
          font: { 
            family: "'Poppins', 'Inter', sans-serif", 
            size: 14, 
            weight: 600,
            letterSpacing: 0.5
          },
          padding: 20,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Active Students by Department",
        color: "#1f2937",
        font: { 
          family: "'Poppins', 'Inter', sans-serif", 
          size: 20, 
          weight: 700,
          letterSpacing: 1
        },
        padding: { top: 10, bottom: 15 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "rgba(147, 51, 234, 0.8)",
        borderWidth: 1,
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        titleFont: { 
          family: "'Poppins', 'Inter', sans-serif", 
          size: 14, 
          weight: 600 
        },
        bodyFont: { 
          family: "'Poppins', 'Inter', sans-serif", 
          size: 12 
        },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        borderRadius: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 10,
        shadowColor: "rgba(0, 0, 0, 0.3)",
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} active student${value !== 1 ? "s" : ""} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { 
          color: "#1f2937",
          font: { 
            family: "'Poppins', 'Inter', sans-serif", 
            size: 12,
            weight: 500,
            letterSpacing: 0.5
          },
          maxRotation: 30,
          minRotation: 30,
        },
        grid: { 
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        ticks: { 
          color: "#1f2937",
          font: { 
            family: "'Poppins', 'Inter', sans-serif", 
            size: 12,
            weight: 500,
            letterSpacing: 0.5
          },
          beginAtZero: true,
          stepSize: 10,
        },
        grid: { 
          color: "rgba(0, 0, 0, 0.05)",
          borderDash: [3, 3],
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Number of Active Students",
          color: "#1f2937",
          font: { 
            family: "'Poppins', 'Inter', sans-serif", 
            size: 14, 
            weight: 600,
            letterSpacing: 0.5
          },
          padding: 10,
        },
        border: {
          display: false,
        },
      },
    },
    animation: {
      duration: 1800,
      easing: "easeOutCubic",
      animateScale: true,
      animateRotate: true,
      delay: (context) => {
        return context.dataIndex * 100;
      },
    },
    elements: {
      bar: {
        borderRadius: 12,
        borderSkipped: false,
      },
    },
    hover: {
      mode: "nearest",
      intersect: true,
      animationDuration: 400,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
      className="relative bg-gradient-to-b from-white/90 to-gray-100/90 p-6 rounded-2xl shadow-xl border border-white/30"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <motion.div
        className="chart-container"
        style={{ height: "400px" }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <Bar data={chartData} options={options} />
      </motion.div>
    </motion.div>
  );
};

const AlumniStatusChart = () => {
  const [chartData, setChartData] = useState({
    labels: ["Employed", "Unemployed"],
    datasets: [{
      label: "Alumni Employment Status",
      data: [300, 150],
      backgroundColor: [
        "rgba(94, 234, 212, 0.7)",
        "rgba(244, 114, 182, 0.7)",
      ],
      borderColor: [
        "rgba(94, 234, 212, 1)",
        "rgba(244, 114, 182, 1)",
      ],
      borderWidth: 2,
      hoverOffset: 30,
    }],
  });

  useEffect(() => {
    const fetchAlumniStatus = async () => {
      try {
        const response = await axios.get('/api/alumni-status-counts/', {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        const data = response.data;

        const colors = data.map((_, index) => {
          const ctx = document.createElement("canvas").getContext("2d");
          const gradient = ctx.createLinearGradient(0, 0, 200, 200);
          const hues = [180, 330]; // Cyan for Employed, Pink for Unemployed
          gradient.addColorStop(0, `hsla(${hues[index % hues.length]}, 70%, 60%, 0.9)`);
          gradient.addColorStop(1, `hsla(${hues[index % hues.length]}, 70%, 50%, 0.7)`);
          return gradient;
        });
        const borderColors = data.map((_, index) => `hsla(${[180, 330][index % 2]}, 70%, 60%, 1)`);

        setChartData({
          labels: data.map(item => item.status),
          datasets: [{
            label: "Alumni Employment Status",
            data: data.map(item => item.count),
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2,
            hoverOffset: 30,
            hoverBorderWidth: 4,
            shadowOffsetX: 4,
            shadowOffsetY: 4,
            shadowBlur: 12,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          }],
        });
      } catch (error) {
        console.error("Failed to fetch alumni status counts:", error);
        setChartData({
          labels: ["Employed", "Unemployed"],
          datasets: [{
            label: "Alumni Employment Status",
            data: [300, 150],
            backgroundColor: [
              "rgba(94, 234, 212, 0.7)",
              "rgba(244, 114, 182, 0.7)",
            ],
            borderColor: [
              "rgba(94, 234, 212, 1)",
              "rgba(244, 114, 182, 1)",
            ],
            borderWidth: 2,
            hoverOffset: 30,
            hoverBorderWidth: 4,
            shadowOffsetX: 4,
            shadowOffsetY: 4,
            shadowBlur: 12,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          }],
        });
      }
    };
    fetchAlumniStatus();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#1f2937",
          font: { 
            family: "'Poppins', 'Inter', sans-serif", 
            size: 14, 
            weight: 600,
            letterSpacing: 0.5
          },
          padding: 15,
          boxWidth: 15,
          boxHeight: 15,
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label} (${data.datasets[0].data[i]})`,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].borderColor[i],
              lineWidth: 2,
              pointStyle: "circle",
              hidden: false,
              index: i,
            }));
          },
        },
      },
      title: {
        display: true,
        text: "Alumni Employment Status",
        color: "#1f2937",
        font: { 
          family: "'Poppins', 'Inter', sans-serif", 
          size: 20, 
          weight: 700,
          letterSpacing: 1
        },
        padding: { top: 10, bottom: 10 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "rgba(147, 51, 234, 0.8)",
        borderWidth: 1,
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        titleFont: { 
          family: "'Poppins', 'Inter', sans-serif", 
          size: 14, 
          weight: 600 
        },
        bodyFont: { 
          family: "'Poppins', 'Inter', sans-serif", 
          size: 12 
        },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} alumni (${percentage}%)`;
          },
        },
      },
      centerText: {
        id: "centerText",
        afterDraw(chart) {
          const { ctx, chartArea: { width, height } } = chart;
          const total = chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
          ctx.save();
          ctx.font = "bold 16px 'Poppins', 'Inter', sans-serif";
          ctx.fillStyle = "#1f2937";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const centerX = width / 2;
          const centerY = height / 2;
          ctx.fillText(`Total: ${total}`, centerX, centerY);
          ctx.restore();
        },
      },
    },
    animation: {
      duration: 2000,
      easing: "easeOutElastic",
      animateScale: true,
      animateRotate: true,
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1, ease: "easeOut", type: "spring", stiffness: 100 }}
      className="relative bg-gradient-to-b from-white/90 to-gray-100/90 p-6 rounded-2xl shadow-xl border border-white/30"
      style={{ backdropFilter: "blur(10px)", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
    >
      <motion.div
        className="chart-container"
        style={{ maxWidth: "450px", margin: "0 auto" }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <Pie data={chartData} options={options} />
      </motion.div>
    </motion.div>
  );
};

const JobCountBarChart = () => {
  const [chartData, setChartData] = useState({
    labels: ["Company A", "Company B", "Company C", "Company D"],
    datasets: [{
      label: "Job Posts by Company",
      data: [50, 30, 20, 10],
      backgroundColor: "rgba(59, 130, 246, 0.7)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 1,
    }],
  });
  const [totalJobs, setTotalJobs] = useState(110);
  const [totalCompanies, setTotalCompanies] = useState(4);

  useEffect(() => {
    const fetchJobCounts = async () => {
      try {
        const response = await axios.get('/api/job-counts/', {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        const { total_jobs, total_companies, company_counts } = response.data;

        const colors = company_counts.map((_, index, arr) => {
          const ctx = document.createElement("canvas").getContext("2d");
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          const hue = (index * 360 / arr.length) % 360;
          gradient.addColorStop(0, `hsla(${hue}, 90%, 60%, 0.9)`);
          gradient.addColorStop(0.3, `hsla(${(hue + 30) % 360}, 90%, 55%, 0.85)`);
          gradient.addColorStop(0.6, `hsla(${(hue + 60) % 360}, 90%, 50%, 0.8)`);
          gradient.addColorStop(1, `hsla(${(hue + 90) % 360}, 90%, 45%, 0.75)`);
          return gradient;
        });
        const hoverColors = company_counts.map((_, index, arr) => {
          const ctx = document.createElement("canvas").getContext("2d");
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          const hue = (index * 360 / arr.length) % 360;
          gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 1)`);
          gradient.addColorStop(0.5, `hsla(${(hue + 30) % 360}, 100%, 65%, 0.95)`);
          gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, 100%, 60%, 0.9)`);
          return gradient;
        });

        setChartData({
          labels: company_counts.map(item => item.company_name),
          datasets: [{
            label: "Job Posts by Company",
            data: company_counts.map(item => item.job_count),
            backgroundColor: colors,
            borderColor: company_counts.map((_, index, arr) => `hsla(${(index * 360 / arr.length) % 360}, 100%, 60%, 1)`),
            borderWidth: 2,
            borderRadius: 12,
            barThickness: 32,
            hoverBackgroundColor: hoverColors,
            hoverBorderWidth: 4,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            shadowBlur: 20,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          }],
        });
        setTotalJobs(total_jobs);
        setTotalCompanies(total_companies);
      } catch (error) {
        console.error("Failed to fetch job counts:", error);
        setChartData({
          labels: ["Company A", "Company B", "Company C", "Company D"],
          datasets: [{
            label: "Job Posts by Company",
            data: [50, 30, 20, 10],
            backgroundColor: [
              "rgba(59, 130, 246, 0.7)",
              "rgba(236, 72, 153, 0.7)",
              "rgba(34, 197, 94, 0.7)",
              "rgba(147, 51, 234, 0.7)",
            ],
            borderColor: [
              "rgba(59, 130, 246, 1)",
              "rgba(236, 72, 153, 1)",
              "rgba(34, 197, 94, 1)",
              "rgba(147, 51, 234, 1)",
            ],
            borderWidth: 2,
            borderRadius: 12,
            barThickness: 32,
            hoverBorderWidth: 4,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            shadowBlur: 20,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          }],
        });
        setTotalJobs(110);
        setTotalCompanies(4);
      }
    };
    fetchJobCounts();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#1f2937",
          font: { 
            family: "'Orbitron', 'Poppins', sans-serif", 
            size: 15, 
            weight: 700,
            letterSpacing: 1.5
          },
          padding: 20,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Job Posts by Company",
        color: "#1f2937",
        font: { 
          family: "'Orbitron', 'Poppins', sans-serif", 
          size: 24, 
          weight: 800,
          letterSpacing: 1.5
        },
        padding: { top: 10, bottom: 15 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "rgba(0, 255, 255, 0.8)",
        borderWidth: 2,
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        titleFont: { 
          family: "'Orbitron', 'Poppins', sans-serif", 
          size: 14, 
          weight: 700 
        },
        bodyFont: { 
          family: "'Orbitron', 'Poppins', sans-serif", 
          size: 12 
        },
        padding: 14,
        cornerRadius: 10,
        boxPadding: 8,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} job${value !== 1 ? "s" : ""} (${percentage}%)`;
          },
        },
      },
      annotation: {
        annotations: {
          averageLine: {
            type: 'line',
            yMin: () => {
              const data = chartData.datasets[0].data;
              const average = data.length ? data.reduce((sum, val) => sum + val, 0) / data.length : 0;
              return average;
            },
            yMax: () => {
              const data = chartData.datasets[0].data;
              const average = data.length ? data.reduce((sum, val) => sum + val, 0) / data.length : 0;
              return average;
            },
            borderColor: 'rgba(0, 255, 255, 0.8)',
            borderWidth: 3,
            borderDash: [6, 6],
            label: {
              content: 'Average',
              enabled: true,
              position: 'end',
              backgroundColor: (ctx) => {
                const chart = ctx.chart;
                const gradient = chart.ctx.createLinearGradient(0, 0, 100, 0);
                gradient.addColorStop(0, 'rgba(0, 255, 255, 0.9)');
                gradient.addColorStop(1, 'rgba(255, 0, 255, 0.9)');
                return gradient;
              },
              color: '#ffffff',
              font: { 
                family: "'Orbitron', 'Poppins', sans-serif", 
                size: 12, 
                weight: 700 
              },
              padding: 8,
              cornerRadius: 6,
              yAdjust: -10,
            },
          },
        },
      },
      centerText: {
        id: "centerText",
        beforeDraw(chart) {
          const { ctx, chartArea: { width, top } } = chart;
          ctx.save();
          ctx.font = "bold 16px 'Orbitron', 'Poppins', sans-serif";
          ctx.fillStyle = "#1f2937";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const centerX = width / 2;
          ctx.fillText(`Total Jobs: ${totalJobs} | Companies: ${totalCompanies}`, centerX, top + 10);
          ctx.restore();
        },
      },
    },
    scales: {
      x: {
        ticks: { 
          color: "#1f2937",
          font: { 
            family: "'Orbitron', 'Poppins', sans-serif", 
            size: 12,
            weight: 700,
            letterSpacing: 1.5
          },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { 
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        ticks: { 
          color: "#1f2937",
          font: { 
            family: "'Orbitron', 'Poppins', sans-serif", 
            size: 12,
            weight: 700,
            letterSpacing: 1.5
          },
          beginAtZero: true,
          stepSize: 1,
        },
        grid: { 
          color: "rgba(0, 0, 0, 0.05)",
          borderDash: [4, 4],
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Number of Job Posts",
          color: "#1f2937",
          font: { 
            family: "'Orbitron', 'Poppins', sans-serif", 
            size: 15, 
            weight: 700,
            letterSpacing: 1.5
          },
          padding: 12,
        },
        border: {
          display: false,
        },
      },
    },
    animation: {
      duration: 2200,
      easing: "easeOutExpo",
      animateScale: true,
      animateRotate: true,
      delay: (context) => {
        return context.dataIndex * 200;
      },
    },
    elements: {
      bar: {
        borderRadius: 12,
        borderSkipped: false,
      },
    },
    hover: {
      mode: "nearest",
      intersect: true,
      animationDuration: 400,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", type: "spring", stiffness: 150 }}
      className="relative bg-gradient-to-b from-white/95 to-gray-50/95 p-6 rounded-2xl shadow-lg border border-white/40 overflow-hidden"
      style={{ 
        backdropFilter: "blur(15px)", 
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15), inset 0 0 12px rgba(255, 255, 255, 0.5)" 
      }}
    >
      <motion.div
        className="absolute inset-0 border-2 border-transparent rounded-2xl"
        animate={{ 
          borderColor: ["rgba(0, 255, 255, 0.5)", "rgba(255, 0, 255, 0.5)", "rgba(0, 255, 255, 0.5)"] 
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="chart-container"
        style={{ height: "400px" }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      >
        <Bar data={chartData} options={options} />
      </motion.div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [adminData, setAdminData] = useState({
    email: "Loading...",
    profileIcon: "fa-user-circle",
  });
  const [stats, setStats] = useState({
    total_departments: 12,
    total_students: 1200,
    total_alumni: 450,
    total_jobs: 300,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('/api/current-user/', {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        setAdminData({
          email: response.data.email,
          profileIcon: "fa-user-circle",
        });
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        setAdminData({
          email: "admin@periyaruniversity.ac.in",
          profileIcon: "fa-user-circle",
        });
        localStorage.removeItem('userEmail');
        navigate('/login');
      }
    };
    fetchAdminData();
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('/api/dashboard-stats/', {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        setStats({
          total_departments: response.data.total_departments,
          total_students: response.data.total_students,
          total_alumni: response.data.total_alumni,
          total_jobs: response.data.total_jobs,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setStats({
          total_departments: 12,
          total_students: 1200,
          total_alumni: 450,
          total_jobs: 300,
        });
        localStorage.removeItem('userEmail');
        navigate('/login');
      }
    };
    fetchDashboardStats();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        await axios.post('/api/logout/', { email: userEmail }, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        localStorage.removeItem('userEmail');
        toast.success("Logged out successfully!", { position: "top-center", transition: Slide });
        navigate('/login');
      } else {
        toast.error("No user logged in!", { position: "top-center", transition: Slide });
        navigate('/login');
      }
    } catch (error) {
      console.error("Logout error:", error.response?.data);
      toast.error(error.response?.data?.message || "Logout failed!", { position: "top-center", transition: Slide });
      localStorage.removeItem('userEmail');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-gray-100 to-purple-100 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-100 text-gray-900 rounded-tl-3xl overflow-y-auto max-h-screen">
        <ToastContainer autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
        <motion.div
          className="flex justify-end items-center mb-6 space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <i className={`fas ${adminData.profileIcon} text-4xl text-purple-500 transition-transform duration-300 hover:scale-110`}></i>
            <span className="font-medium text-gray-700">{adminData.email}</span>
          </div>
          <motion.button
            className="flex items-center bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 shadow-lg hover:ring-2 hover:ring-red-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
          >
            Logout
          </motion.button>
        </motion.div>
        <motion.div
          className="text-center glassmorphism rounded-2xl shadow-xl p-4 mb-4 border-l-4 border-purple-700 bg-gradient-to-r from-purple-100 to-blue-100"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold text-purple-800 tracking-tight drop-shadow-md">
            Welcome to Admin Portal Periyar University
          </h1>
          <img
            src="/Logo.png"
            alt="Periyar University Logo"
            className="mx-auto mt-4 h-32 transition-transform duration-500 hover:scale-110"
          />
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard
            title="Total Departments"
            value={stats.total_departments}
            color="bg-gradient-to-r from-purple-600 to-purple-400"
            icon="📚"
          />
          <GlassCard
            title="Total Students"
            value={stats.total_students}
            color="bg-gradient-to-r from-blue-600 to-blue-400"
            icon="🎓"
          />
          <GlassCard
            title="Alumni Status"
            value={stats.total_alumni}
            color="bg-gradient-to-r from-green-600 to-green-400"
            icon="🌟"
          />
          <GlassCard
            title="Total Jobs Counts"
            value={stats.total_jobs}
            color="bg-gradient-to-r from-pink-600 to-pink-400"
            icon="💼"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className="glassmorphism p-6 rounded-2xl shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Department-wise Student Distribution</h3>
            <DepartmentPieChart />
          </motion.div>
          <motion.div
            className="glassmorphism p-6 rounded-2xl shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Active Students by Department</h3>
            <ActiveStudentsBarChart />
          </motion.div>
          <motion.div
            className="glassmorphism p-6 rounded-2xl shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Alumni Employment Status</h3>
            <AlumniStatusChart />
          </motion.div>
          <motion.div
            className="glassmorphism p-6 rounded-2xl shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Job Posts by Company</h3>
            <JobCountBarChart />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;