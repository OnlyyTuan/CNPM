// frontend/src/api/dashboardApi.js
// API client cho Dashboard

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

const API_URL = API_ENDPOINTS.DASHBOARD;

// Lấy tất cả dữ liệu dashboard
export const getDashboardData = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Lấy thống kê tổng quan
export const getOverviewStats = async () => {
  const response = await axios.get(`${API_URL}/overview`);
  return response.data;
};

// Lấy thống kê xe buýt theo trạng thái
export const getBusStatusStats = async () => {
  const response = await axios.get(`${API_URL}/bus-status`);
  return response.data;
};

// Lấy phân bố học sinh theo tuyến
export const getStudentsByRoute = async () => {
  const response = await axios.get(`${API_URL}/students-by-route`);
  return response.data;
};

// Lấy danh sách xe và tài xế chưa phân công
export const getUnassignedData = async () => {
  const response = await axios.get(`${API_URL}/unassigned`);
  return response.data;
};
