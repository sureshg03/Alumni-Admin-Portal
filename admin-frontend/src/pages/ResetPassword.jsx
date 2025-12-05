import React, { useState } from "react";
import axios from "axios";
import { toast, Slide } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";

function ResetPassword({ email }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  
  const isValidPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

  const isMatch = password === confirm;

  const handleReset = async () => {
    if (!isMatch) {
      toast.error("Passwords do not match", { transition: Slide });
      return;
    }
    try {
      const res = await axios.post("/api/reset_password/", {
        email,
        password,
      });
      toast.success(res.data.message, { transition: Slide });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch {
      toast.error("Failed to reset password", { transition: Slide });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 to-purple-300 flex items-center justify-center">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">
          Set New Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter and confirm your new password.
        </p>

        <div className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              New Password
            </label>
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2">
              <Lock className="text-purple-500 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 border-none outline-none focus:ring-0"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-purple-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2">
              <Lock className="text-purple-500 mr-2" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 border-none outline-none focus:ring-0"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="text-purple-600"

              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={!isValidPassword || !isMatch}
            className="w-full py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 active:scale-95 transition-transform shadow-md disabled:opacity-50"
          >
            Reset Password
          </button>

          <p className="text-sm text-center text-gray-500">
         Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
          </p>

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
