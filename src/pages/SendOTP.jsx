import React, { useState } from "react";
import { sendOtp } from "../utils/api";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function SendOTP() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // ✅ now sending email instead of phone
    const res = await sendOtp({ email, username });

    setLoading(false);
    if (res.ok) {
      navigate("/verify-otp", { state: { email } });
    } else {
      alert(res.data?.error || "Failed to send OTP");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          {/* Beautiful Logo */}
          <div className="relative mb-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] animate-shine"></div>
              <div className="relative z-10">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div className="absolute top-0 left-0 w-3 h-3 bg-white/30 rounded-bl-2xl"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-white/30 rounded-br-2xl"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-white/30 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-white/30 rounded-tr-2xl"></div>
            </div>
            <div className="absolute inset-0 bg-blue-400/30 rounded-2xl blur-md -z-10 animate-pulse"></div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Welcome to SirVerse</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" full loading={loading}>
            Send OTP
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
