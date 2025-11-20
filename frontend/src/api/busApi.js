// frontend/src/api/busApi.js
// API client cho Buses

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

const API_URL = API_ENDPOINTS.BUSES;

// Lấy tất cả xe buýt
export const getAllBuses = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Lấy xe buýt theo ID
export const getBusById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Tạo xe buýt mới
export const createBus = async (busData) => {
  const response = await axios.post(API_URL, busData);
  return response.data;
};

// Cập nhật xe buýt
export const updateBus = async (id, busData) => {
  const response = await axios.put(`${API_URL}/${id}`, busData);
  return response.data;
};

// Xóa xe buýt
export const deleteBus = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Lấy vị trí trực tiếp của tất cả xe buýt
export const getLiveBusLocations = async () => {
  const response = await axios.get(`${API_URL}/live-location`, { 
    params: { _ts: Date.now() },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  console.log('🌐 Response từ API:', response.data);
  return response.data;
};
