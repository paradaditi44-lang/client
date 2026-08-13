import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const API = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : "/api",
});

export default API;