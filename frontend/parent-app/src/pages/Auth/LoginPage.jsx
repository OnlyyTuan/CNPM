import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import useAuthStore from "../../hooks/useAuthStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginSuccess } = useAuthStore();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;
    try {
      setLoading(true);
      const res = await axiosClient.post("/auth/login", {
        username: formData.username,
        password: formData.password,
      });
      if (res.data && res.data.success) {
        const { user, token } = res.data.data;
        if (String(user.role).toLowerCase() !== "parent") return;
        loginSuccess(user, token);
        navigate("/");
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Đăng nhập Phụ huynh</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="username" value={formData.username} onChange={handleChange} className="w-full border rounded p-2" placeholder="Tên đăng nhập" />
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border rounded p-2" placeholder="Mật khẩu" />
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded p-2">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
