// frontend/src/api/axiosClient.js
import axios from "axios";
import { API_BASE_URL } from "../config/api.config";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Thêm token JWT tự động vào header nếu có
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Có thể unwrap response nếu muốn, ở đây trả nguyên response
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;
