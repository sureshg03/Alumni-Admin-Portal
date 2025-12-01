import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, CheckCircle2, XCircle, Check, X,
} from "lucide-react";
import { toast, Toaster } from "sonner";

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) =>
  /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/.test(password);

function SetAdmin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { email, password, confirmPassword } = formData;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      return setError("All fields are required.");
    }

    if (!validateEmail(email)) {
      return setError("Please enter a valid email address.");
    }

    if (!validatePassword(password)) {
      return setError(
        "Password must be at least 6 characters, include an uppercase letter and a number."
      );
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      await axios.post("http://localhost:8000/api/create-admin/", {
        email,
        password,
      });

      toast.success("Admin created successfully!", {
        description: "Redirecting to login page...",
        icon: <CheckCircle2 className="text-green-500" />,
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error("Failed to create admin. Please try again.", {
        icon: <XCircle className="text-red-500" />,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300">
      <Toaster position="top-right" richColors />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">
          Admin Setup
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center animate-pulse">
            {error}
          </p>
        )}

        <div className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <div className={`flex items-center rounded-xl px-4 py-2 border-2 ${
              email
                ? validateEmail(email)
                  ? "border-green-500"
                  : "border-red-500"
                : "border-gray-300"
            } transition-all duration-300`}>
              <Mail className="text-purple-500 mr-3" />
            <input
  type="email"
  name="email"
  id="email"
  value={email}
  onChange={handleChange}
  placeholder="Enter email"
  className="w-full text-gray-700 placeholder-gray-400 border-none outline-none focus:outline-none focus:ring-0 focus:border-none autofill:shadow-[inset_0_0_0px_1000px_white] autofill:text-gray-700"
/>

              {email && (
                validateEmail(email)
                  ? <Check className="text-green-500" size={18} />
                  : <X className="text-red-500" size={18} />
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <div className={`relative flex items-center rounded-xl px-4 py-2 border-2 ${
              password
                ? validatePassword(password)
                  ? "border-green-500"
                  : "border-red-500"
                : "border-gray-300"
            } transition-all duration-300`}>
              <Lock className="text-purple-500 mr-3" />
              <input
  type={showPassword ? "text" : "password"}
  name="password"
  id="password"
  value={password}
  onChange={handleChange}
  placeholder="Enter password"
  className="w-full bg-transparent outline-none focus:ring-0 focus:outline-none focus:border-none text-gray-700 placeholder-gray-400 pr-10"
/>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-8 text-purple-400 hover:text-purple-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {password && (
                validatePassword(password)
                  ? <Check className="text-green-500 absolute right-2" size={18} />
                  : <X className="text-red-500 absolute right-2" size={18} />
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">
              Confirm Password
            </label>
            <div className={`relative flex items-center rounded-xl px-4 py-2 border-2 ${
              confirmPassword
                ? confirmPassword === password
                  ? "border-green-500"
                  : "border-red-500"
                : "border-gray-300"
            } transition-all duration-300`}>
              <Lock className="text-purple-500 mr-3" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full bg-transparent outline-none focus:ring-0 focus:outline-none focus:border-none text-gray-700 placeholder-gray-400 pr-10"
             />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-8 text-purple-400 hover:text-purple-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {confirmPassword && (
                confirmPassword === password
                  ? <Check className="text-green-500 absolute right-2" size={18} />
                  : <X className="text-red-500 absolute right-2" size={18} />
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:scale-95 transition-transform shadow-lg"
          >
            Create Admin Account
          </button>
        </div>
      </form>
    </div>
  );
}

export default SetAdmin;
