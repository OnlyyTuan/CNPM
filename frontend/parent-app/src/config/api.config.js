export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export const API_ENDPOINTS = {
  PARENTS: `${API_BASE_URL}/parents`,
  AUTH: `${API_BASE_URL}/auth`,
};
