import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../utils/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "",
    username: "",
    identifier: "", // Use identifier instead of separate email/phone
    password: "",
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    class_level: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      // Prepare data for backend
      const payload = {
        username: form.username,
        identifier: form.identifier, // This can be email OR phone
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        dob: form.dob,
        gender: form.gender,
        class_level: form.role === "student" ? form.class_level : null,
      };

      const response = await registerUser(payload);

      if (response.ok) {
        // ✅ SUCCESS - Backend returns success message
        setMessage("Account created successfully! Redirecting to login...");
        
        // Wait a bit then redirect to login
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        
      } else {
        // ❌ ERROR - Show backend error message
        setMessage(response.data?.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      setMessage("Network error. Please check your connection and try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Create Your Account
        </h2>

        {/* Role */}
        <select
          name="role"
          value={form.role}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-400"
          onChange={handleChange}
          required
        >
          <option value="">Who are you?</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        {/* Identifier (Email or Phone) */}
        <input
          name="identifier"
          placeholder="Email or Phone Number"
          value={form.identifier}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          onChange={handleChange}
          required
        />

        {/* Username & Password */}
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password (8+ characters)"
          value={form.password}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          onChange={handleChange}
          required
          minLength="8"
        />

        {/* Personal Info */}
        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          onChange={handleChange}
          required
        />
        <input
          name="last_name"
          placeholder="Last Name (optional)"
          value={form.last_name}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          onChange={handleChange}
        />
        <input
          type="date"
          name="dob"
          value={form.dob}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          onChange={handleChange}
          required
        />

        <select
          name="gender"
          value={form.gender}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        {form.role === "student" && (
          <select
            name="class_level"
            value={form.class_level}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3"
            onChange={handleChange}
            required
          >
            <option value="">Select Class</option>
            {["6", "7", "8", "9", "10", "11", "12"].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Registering..." : "Create Account"}
        </button>

        {/* Message */}
        {message && (
          <p className={`text-center text-sm mt-3 ${
            message.includes("success") ? "text-green-600" : "text-red-500"
          }`}>
            {message}
          </p>
        )}

        {/* Login Redirect */}
        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
