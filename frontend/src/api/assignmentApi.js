// frontend/src/api/assignmentApi.js
// API client cho Phân công tài xế

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

const API_URL = API_ENDPOINTS.ASSIGNMENTS;

// Lấy tất cả phân công hiện tại
export const getAllAssignments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Lấy danh sách có thể phân công
export const getAvailableForAssignment = async () => {
  const response = await axios.get(`${API_URL}/available`);
  return response.data;
};

// Phân công tài xế cho xe buýt
export const assignDriverToBus = async (driverId, busId) => {
  const response = await axios.post(`${API_URL}/assign-driver-bus`, {
    driver_id: driverId,
    bus_id: busId,
  });
  return response.data;
};

// Phân công xe buýt cho tuyến đường
export const assignBusToRoute = async (busId, routeId) => {
  const response = await axios.post(`${API_URL}/assign-bus-route`, {
    bus_id: busId,
    route_id: routeId,
  });
  return response.data;
};

// Hủy phân công tài xế
export const unassignDriver = async (driverId) => {
  const response = await axios.delete(`${API_URL}/unassign-driver/${driverId}`);
  return response.data;
};
