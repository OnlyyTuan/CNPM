import { create } from "zustand";

const useAuthStore = create((set, get) => ({
  isLoggedIn: !!localStorage.getItem("token"),
  role: JSON.parse(localStorage.getItem("user") || "{}").role || null,
  user: JSON.parse(localStorage.getItem("user") || "{}") || null,
  loginSuccess: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ isLoggedIn: true, role: user.role, user });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ isLoggedIn: false, role: null, user: null });
  },
}));

export default useAuthStore;
