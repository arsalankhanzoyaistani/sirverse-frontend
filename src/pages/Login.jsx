import React, { useState } from "react";
import { loginUser } from "../utils/api";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await loginUser({ identifier, password });
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      setMessage("Login successful!");
      window.location.href = "/"; // redirect to home
    } else {
      setMessage(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          placeholder="Email, Phone, or Username"
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded mt-2"
        >
          Login
        </button>

        {message && <p className="text-center mt-2 text-sm">{message}</p>}
      </form>
    </div>
  );
}
