// src/socket.js
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000"; // backend URL

// Export a singleton socket connection
export const socket = io(API_URL, {
  autoConnect: false, // we connect manually after login
});

export default socket;
