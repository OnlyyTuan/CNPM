// frontend/src/config/api.config.js
// Cấu hình API base URL

export const API_BASE_URL = "http://localhost:3000/api/v1";

export const API_ENDPOINTS = {
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  STUDENTS: `${API_BASE_URL}/students`,
  DRIVERS: `${API_BASE_URL}/drivers`,
  BUSES: `${API_BASE_URL}/buses`,
  SCHEDULES: `${API_BASE_URL}/schedules`,
  ASSIGNMENTS: `${API_BASE_URL}/assignments`,
  ROUTES: `${API_BASE_URL}/routes`,
  PARENTS: `${API_BASE_URL}/parents`,
  FEATURE_FLAGS: `${API_BASE_URL}/feature-flags`,
};
