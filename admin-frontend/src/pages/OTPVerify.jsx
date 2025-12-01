import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function OTPVerify({ email, setStep }) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(300);
  const inputRefs = useRef([]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChange = (index, value) => {
    if (/^\d$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const resendOtp = async () => {
    try {
      await axios.post("http://localhost:8000/api/send_otp/", { email });
      setTimer(300);
      toast.success("OTP sent successfully", { transition: Slide });
    } catch {
      toast.error("Resend failed", { transition: Slide });
    }
  };

  const handleVerify = async () => {
    try {
      const joinedOtp = otp.join("");
      const res = await axios.post("http://localhost:8000/api/verify_otp/", {
        email,
        otp: joinedOtp,
      });
      toast.success(res.data.message, { transition: Slide });
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed", {
        transition: Slide,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 to-purple-300 flex items-center justify-center">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-purple-700 mb-4">OTP Verification</h2>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit OTP sent to <span className="font-medium">{email}</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              className="w-12 h-12 border-2 border-purple-300 rounded-xl text-center text-xl font-semibold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            />
          ))}
        </div>

        {/* Timer */}
        <div className="mb-4 text-gray-500 text-sm">
          Time left:{" "}
          <span className="font-medium">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </span>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:scale-95 transition-transform shadow-lg mb-3"
        >
          Verify OTP
        </button>

        {/* Resend */}
        <button
          onClick={resendOtp}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium transition"
        >
          Resend OTP
        </button>
      </div>

      {/* ✅ Add ToastContainer here (inside return) to make toast visible */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        theme="light"
      />
    </div>
  );
}

export default OTPVerify;
