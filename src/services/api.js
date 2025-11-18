// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

export async function getPing() {
  const response = await fetch(`${API_URL}/ping`);
  return response.json();
}

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return response.json();
}

export async function loginUser(loginData) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });
  return response.json();
}
