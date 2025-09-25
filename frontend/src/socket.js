// src/socket.js
import { io } from "socket.io-client";

const apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:5000";

export const socket = io(apiUrl);
