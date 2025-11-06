import React, { useState } from "react";
import { registerUser } from "../utils/api";

export default function Register() {
  const [form, setForm] = useState({
    role: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    class_level: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await registerUser(form);
    setMessage(data.message || data.error || "Something went wrong");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

        {/* Role */}
        <select
          name="role"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          required
        >
          <option value="">Who are you?</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        {/* Email or Phone */}
        <input
          name="email"
          placeholder="Email (optional)"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone (optional)"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
        />

        <input
          name="username"
          placeholder="Username"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password (8+ chars)"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          required
        />

        <input
          name="first_name"
          placeholder="First Name"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          required
        />
        <input
          name="last_name"
          placeholder="Last Name (optional)"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
        />

        <input
          name="dob"
          type="date"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          required
        />

        <select
          name="gender"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        {form.role === "student" && (
          <select
            name="class_level"
            className="w-full p-2 border rounded mb-2"
            onChange={handleChange}
          >
            <option value="">Select Class</option>
            {["6", "7", "8", "9", "10", "11", "12"].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mt-2"
        >
          Register
        </button>

        {message && <p className="text-center mt-2 text-sm">{message}</p>}
      </form>
    </div>
  );
}
