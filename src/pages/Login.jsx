// frontend/src/pages/Login.jsx - COMPLETE NEW LOGIN PAGE
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!identifier.trim() || !password) {
      setError("Please enter your email/phone and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await login(identifier, password);
      
      if (res.ok) {
        // Save token and user info
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("username", res.data.user.username);
        localStorage.setItem("user_id", res.data.user.id);
        
        // Redirect to posts page
        navigate("/posts");
      } else {
        setError(res.data?.error || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <img
                src="/logo.png"
                alt="SirVerse Logo"
                className="w-full h-full rounded-2xl object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] animate-shine"></div>
            </div>
            <div className="absolute inset-0 bg-blue-400/30 rounded-2xl blur-md -z-10 animate-pulse"></div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your SirVerse account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email, Phone or Username"
            type="text"
            placeholder="Enter your email, phone or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" full loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium">
              Create one here
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
