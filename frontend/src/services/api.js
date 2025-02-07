import axios from "axios";

const API_URL = "http://localhost:5000"; // Adjust if your backend runs on a different port

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
