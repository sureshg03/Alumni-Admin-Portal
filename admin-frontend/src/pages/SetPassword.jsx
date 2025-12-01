import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const email = localStorage.getItem("email");
  const navigate = useNavigate();
  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    await axios.post("http://localhost:8000/api/set-password/", {
      email,
      password,
    });
    alert("Password set successfully");
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-gradient-to-l from-pink-300 to-yellow-300 flex justify-center items-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Set New Password</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" className="w-full px-4 py-2 mb-4 border rounded" />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full px-4 py-2 mb-6 border rounded" />
        <button onClick={handleSetPassword} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded">Set Password</button>
      </div>
    </div>
  );
}
export default SetPassword;
