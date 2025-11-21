// frontend/driver-app/src/hooks/useAuthStore.js

import { create } from "zustand";

// ------------------------------------------------------------------
// State Ban đầu: Khôi phục từ LocalStorage (nếu có)
// ------------------------------------------------------------------
const token = localStorage.getItem("token") || null;
const user = JSON.parse(localStorage.getItem("user")) || null;

const useAuthStore = create((set) => ({
  // Trạng thái
  token: token,
  user: user,
  isLoggedIn: !!token,
  role: user ? user.role : null,

  // ------------------------------------------------------------------
  // Actions (Hành động)
  // ------------------------------------------------------------------

  // Hành động Đăng nhập
  login: ({ token, user }) => {
    // 1. Lưu vào Store
    set({
      token: token,
      user: user,
      isLoggedIn: true,
      role: user.role,
    });
    // 2. Lưu vào LocalStorage để duy trì trạng thái khi refresh
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Hành động Đăng xuất
  logout: () => {
    // 1. Xóa khỏi Store
    set({
      token: null,
      user: null,
      isLoggedIn: false,
      role: null,
    });
    // 2. Xóa khỏi LocalStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Hành động kiểm tra trạng thái ban đầu (đã được xử lý ở đầu file)
  initialize: () => {
    // Thường không cần làm gì nếu đã khôi phục ở đầu file
  },
}));

export default useAuthStore;
