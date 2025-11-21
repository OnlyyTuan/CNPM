// frontend/driver-app/src/api/axiosClient.js

import axios from "axios";

// Định nghĩa base URL của Backend (sử dụng biến môi trường nếu cần)
const BASE_URL = "http://localhost:3000/api/v1";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ------------------------------------------------------------------
// INTERCEPTOR (Middleware cho Axios)
// ------------------------------------------------------------------

// REQUEST Interceptor: Tự động thêm Token vào Header trước khi gửi
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy Token từ localStorage (hoặc từ store Auth)
    const token = localStorage.getItem("token");

    if (token) {
      // Đính kèm Token vào Header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE Interceptor: Xử lý lỗi toàn cục (ví dụ: Token hết hạn)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Ví dụ: Xử lý lỗi 401 (Unauthorized - Token hết hạn)
    if (error.response && error.response.status === 401) {
      console.error("401 Unauthorized: Token hết hạn hoặc không hợp lệ.");
      // TẠM THỜI: Xóa token và reload trang để buộc đăng nhập lại
      localStorage.removeItem("token");
      // Bạn có thể dùng hook hoặc store để redirect người dùng ở đây
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
