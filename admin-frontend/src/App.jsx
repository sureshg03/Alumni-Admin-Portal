import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SetAdmin from "./pages/SetAdmin";
import Login from "./pages/Login";
import SetPassword from "./pages/SetPassword";
import Dashboard from "./pages/Dashboard";
import ForgotPasswordFlow from "./pages/ForgotPasswordFlow";
import AddDepartment from "./pages/AddDepartment";
import ManageDepartment from "./pages/ManageDepartment";
import ViewDegrees from './pages/ViewDegrees';
import ViewStudents from './pages/ViewStudents';
import Newsletter from "./pages/Newsletter";
import Surveys from "./pages/Surveys";
import SuccessStories from './pages/SuccessStories';
import Feedback from "./pages/Feedback";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CheckFirstAdmin />} />
        <Route path="/set-admin" element={<SetAdmin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/departments" element={<ProtectedRoute element={<AddDepartment />} />} />
        <Route path="/add-department" element={<ProtectedRoute element={<AddDepartment />} />} />
        <Route path="/manage-department" element={<ProtectedRoute element={<ManageDepartment />} />} />
        <Route path="/view-degrees/:departmentId" element={<ProtectedRoute element={<ViewDegrees />} />} />
        <Route path="/view-students/:degreeId" element={<ProtectedRoute element={<ViewStudents />} />} />
        <Route path="/newsletter" element={<ProtectedRoute element={<Newsletter />} />} />
        <Route path="/surveys" element={<ProtectedRoute element={<Surveys />} />} />
        <Route path="/success-stories" element={<ProtectedRoute element={<SuccessStories />} />} />
        <Route path="/feedback" element={<ProtectedRoute element={<Feedback />} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

const CheckFirstAdmin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("/api/check-admin-exists/")
      .then((res) => {
        if (res.data.exists) {
          const userEmail = localStorage.getItem('userEmail');
          if (userEmail) {
            axios
              .get("/api/current-user/", { withCredentials: true })
              .then((response) => {
                if (response.data.email) {
                  navigate("/dashboard");
                } else {
                  localStorage.removeItem('userEmail');
                  navigate("/login");
                }
              })
              .catch(() => {
                localStorage.removeItem('userEmail');
                navigate("/login");
              });
          } else {
            navigate("/login");
          }
        } else {
          navigate("/set-admin");
        }
      })
      .catch((err) => {
        console.error("Error checking admin:", err);
        navigate("/login");
      });
  }, [navigate]);
  return <div>Loading...</div>;
};

const ProtectedRoute = ({ element }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await axios.get("/api/current-user/", { withCredentials: true });
        if (response.data.email) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('userEmail');
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        localStorage.removeItem('userEmail');
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default App;