import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    console.log("Sending login request:", { email, password });
    try {
      const loginRes = await axios.post("/api/login/", { email, password }, { withCredentials: true });
      console.log("Login response:", loginRes.data);
      if (loginRes.data.status === "success") {
        // Store email in localStorage
        localStorage.setItem('userEmail', loginRes.data.email);
        toast.success("Login Successful!", { position: "top-center", transition: Slide });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(loginRes.data.message || "Invalid credentials!", { position: "top-center", transition: Slide });
      }
    } catch (error) {
      console.error("Login error:", error.response?.data);
      toast.error(error.response?.data?.message || "Login failed! Please try again.", { position: "top-center", transition: Slide });
    }
  };

  if (loading) {
    return (
      <div className="splash-screen flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-purple-500/30 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-400/30 rounded-full blur-2xl bottom-20 right-20 animate-pulse"></div>
        <div className="relative z-10 flex flex-col items-center">
          <ClipLoader color="#ffffff" size={65} speedMultiplier={1.3} />
          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent drop-shadow-md tracking-wide animate-pulse">
            Loading Portal...
          </h2>
          <p className="text-sm mt-3 opacity-80 tracking-wide font-medium animate-fadeIn delay-500">Please wait while we prepare your experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <ToastContainer autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
      <div className="bubble-container">
        {Array.from({ length: 10 }, (_, i) => (
          <div className="bubble" key={i}></div>
        ))}
      </div>
      <div className="card-container">
        <div className="grad-cap"></div>
        <div className="w-full max-w-5xl rounded-3xl glass-card overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="left-panel bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-600 text-white p-12 flex flex-col justify-center items-center text-center min-h-[500px]">
            <img src="/Logo.png" alt="Periyar Logo" className="w-32 h-32 rounded-full ring-4 ring-white/30 shadow-2xl logo-animation mb-6" />
            <h2 className="text-4xl script-font mb-2 drop-shadow-lg">Periyar University</h2>
            <h3 className="text-2xl script-font mb-4 text-yellow-200">Alumni Association</h3>
            <p className="text-sm max-w-md opacity-90 leading-relaxed">
              Connect with your alma mater, manage alumni events, and empower the community with seamless access.
            </p>
          </div>
          <div className="bg-white/95 p-8 lg:p-12 flex items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
              <h2 className="text-4xl baloo-font text-purple-900 text-center font-bold drop-shadow-sm">Admin Portal</h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-indigo-800 mb-1 tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md bg-white/90`}
                    required
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-semibold text-indigo-800 mb-1 tracking-wide">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md bg-white/90`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-[38px] right-3 text-indigo-700 hover:scale-110 transition-transform"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash size={20} className="transition-opacity duration-300" /> : <FaEye size={20} className="transition-opacity duration-300" />}
                  </button>
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg btn-glow tracking-wider"
                >
                  Sign In
                </button>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-indigo-700 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;