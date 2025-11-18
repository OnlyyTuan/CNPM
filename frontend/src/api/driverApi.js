// frontend/src/api/driverApi.js
// API client cho Drivers

import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../config/api.config";

const API_URL = API_ENDPOINTS.DRIVERS;

// Lấy tất cả tài xế
export const getAllDrivers = async () => {
  const response = await axiosClient.get("/drivers");
  return response.data;
};

// Lấy tài xế theo ID
export const getDriverById = async (id) => {
  const response = await axiosClient.get(`/drivers/${id}`);
  return response.data;
};

// Tạo tài xế mới
// Create driver: accepts either driverData or { userData, driverData }
export const createDriver = async (payload) => {
  const response = await axiosClient.post("/drivers", payload);
  return response.data;
};

// Cập nhật tài xế
export const updateDriver = async (id, driverData) => {
  const response = await axiosClient.put(`/drivers/${id}`, driverData);
  return response.data;
};

// Lấy danh sách tài xế chưa có xe
export const getAvailableDrivers = async () => {
  const response = await axiosClient.get("/drivers/available");
  return response.data;
};

// Xóa tài xế
export const deleteDriver = async (id) => {
  const response = await axiosClient.delete(`/drivers/${id}`);
  return response.data;
};
