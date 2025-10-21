// frontend/src/api/driverApi.js
// API client cho Drivers

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

const API_URL = API_ENDPOINTS.DRIVERS;

// Lấy tất cả tài xế
export const getAllDrivers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Lấy tài xế theo ID
export const getDriverById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Tạo tài xế mới
export const createDriver = async (driverData) => {
  const response = await axios.post(API_URL, driverData);
  return response.data;
};

// Cập nhật tài xế
export const updateDriver = async (id, driverData) => {
  const response = await axios.put(`${API_URL}/${id}`, driverData);
  return response.data;
};

// Xóa tài xế
export const deleteDriver = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
