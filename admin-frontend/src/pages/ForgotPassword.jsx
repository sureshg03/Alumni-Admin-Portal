import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Slide } from "react-toastify";
import { Mail, Check, X } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function ForgotPassword({ setStep, setEmail }) {
  const [inputEmail, setInputEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/get-logged-in-admin-email/");
        if (res.data.email) {
          setInputEmail(res.data.email);
        }
      } catch (err) {
        console.error("Failed to fetch email:", err);
      }
    };
    fetchEmail();
  }, []);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/send_otp/", {
        email: inputEmail,
      });
      toast.success(res.data.message, { transition: Slide });
      setEmail(inputEmail);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP", {
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 to-purple-300 flex items-center justify-center">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">
          Forgot Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your registered email to receive an OTP.
        </p>

        <div className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <div className={`flex items-center rounded-xl px-4 py-2 border-2 ${
              inputEmail
                ? validateEmail(inputEmail)
                  ? "border-green-500"
                  : "border-red-500"
                : "border-gray-300"
            } transition-all duration-300`}>
              <Mail className="text-purple-500 mr-3" />
              <input
                type="email"
                id="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full text-gray-700 placeholder-gray-400 border-none outline-none focus:outline-none focus:ring-0 focus:border-none autofill:shadow-[inset_0_0_0px_1000px_white] autofill:text-gray-700"
/>

              {inputEmail && (
                validateEmail(inputEmail)
                  ? <Check className="text-green-500" size={18} />
                  : <X className="text-red-500" size={18} />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSendOtp}
            disabled={!validateEmail(inputEmail) || loading}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:scale-95 transition-transform shadow-lg disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-sm text-center text-gray-500">
            Registered email only | OTP valid for 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
