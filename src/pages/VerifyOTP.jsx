import React, { useState } from "react";
import { verifyOtp } from "../utils/api";
import { useLocation, useNavigate } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // ✅ switched from phone → email

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      alert("Email not found");
      return navigate("/send-otp");
    }

    setLoading(true);
    const res = await verifyOtp({ email, otp }); // ✅ send email instead of phone
    setLoading(false);

    if (res.ok) {
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("username", res.data.user.username);
      localStorage.setItem("user_id", res.data.user.id); // Add user ID for chat functionality
      navigate("/posts");
    } else {
      alert(res.data?.error || "Invalid OTP");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-100">
      <GlassCard className="w-full max-w-md p-8 shadow-xl rounded-3xl backdrop-blur-lg bg-white/60 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative mb-4">
            {/* Your Logo Image */}
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <img
                src="/logo.png"
                alt="SirVerse Logo"
                className="w-full h-full rounded-2xl object-cover border-2 border-white"
              />
              {/* Optional Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] animate-shine"></div>
            </div>
            {/* Optional Glow Effect */}
            <div className="absolute inset-0 bg-blue-400/30 rounded-2xl blur-md -z-10 animate-pulse"></div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to <span className="font-medium text-blue-600">{email}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="OTP Code"
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
          />

          <Button
            type="submit"
            full
            loading={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/send-otp")}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Wrong email? Go back
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
