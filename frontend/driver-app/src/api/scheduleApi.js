// frontend/src/api/scheduleApi.js
// API client cho Lịch trình

import axios from "axios";
import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "../config/api.config";

const API_URL = API_ENDPOINTS.SCHEDULES;

// Lấy tất cả lịch trình
export const getAllSchedules = async () => {
  const response = await axiosClient.get(API_URL);
  return response.data;
};

// Lấy lịch trình theo ID
export const getScheduleById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Lấy lịch trình theo khoảng thời gian
export const getSchedulesByDateRange = async (startDate, endDate) => {
  const response = await axiosClient.get(`${API_URL}/range`, {
    params: { startDate, endDate },
  });
  return response.data;
};

// Lấy lịch trình của tài xế đang đăng nhập (server lọc theo token)
export const getMySchedules = async (startDate = null, endDate = null) => {
  const response = await axiosClient.get(`${API_URL}/my`, {
    params: startDate && endDate ? { startDate, endDate } : {},
  });
  return response.data;
};

// Tạo lịch trình mới
export const createSchedule = async (scheduleData) => {
  const response = await axios.post(API_URL, scheduleData);
  return response.data;
};

// Cập nhật lịch trình
export const updateSchedule = async (id, scheduleData) => {
  const response = await axios.put(`${API_URL}/${id}`, scheduleData);
  return response.data;
};

// Xóa lịch trình
export const deleteSchedule = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Lấy thống kê lịch trình
export const getScheduleStatistics = async () => {
  const response = await axios.get(`${API_URL}/statistics`);
  return response.data;
};
