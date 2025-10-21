// frontend/src/api/routeApi.js
// API client cho Tuyến đường

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

const API_URL = API_ENDPOINTS.ROUTES;

// Lấy tất cả tuyến đường
export const getAllRoutes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Lấy tuyến đường theo ID
export const getRouteById = async (id) => {
  const response = await axios.get(`${API_URL}/routes/${id}`);
  return response.data;
};
