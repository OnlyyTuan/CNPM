// frontend/src/api/studentApi.js
// API client cho Students

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

const API_URL = API_ENDPOINTS.STUDENTS;

// Lấy tất cả học sinh
export const getAllStudents = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Lấy học sinh theo ID
export const getStudentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Tạo học sinh mới
export const createStudent = async (studentData) => {
  const response = await axios.post(API_URL, studentData);
  return response.data;
};

// Cập nhật học sinh
export const updateStudent = async (id, studentData) => {
  const response = await axios.put(`${API_URL}/${id}`, studentData);
  return response.data;
};

// Xóa học sinh
export const deleteStudent = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
