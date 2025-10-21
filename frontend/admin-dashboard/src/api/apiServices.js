// frontend/admin-dashboard/src/api/apiServices.js

import axiosClient from "./axiosClient";

const apiServices = {
  // ------------------------------------------------------------------
  // AUTH SERVICE
  // ------------------------------------------------------------------

  login: (credentials) => {
    // POST /api/v1/auth/login
    return axiosClient.post("/auth/login", credentials);
  },

  register: (data) => {
    // POST /api/v1/auth/register
    return axiosClient.post("/auth/register", data);
  },

  // ------------------------------------------------------------------
  // DRIVER SERVICE
  // ------------------------------------------------------------------

  getAllDrivers: () => {
    // GET /api/v1/drivers (Yêu cầu Token)
    return axiosClient.get("/drivers");
  },

  // ------------------------------------------------------------------
  // PARENT SERVICE
  // ------------------------------------------------------------------

  getAllParents: () => {
    // GET /api/v1/parents (Yêu cầu Token)
    return axiosClient.get("/parents");
  },

  getAllStudents: () => {
    // Giả định bạn đã tạo endpoint GET /api/v1/students ở Backend
    return axiosClient.get("/students");
  },

  getAllDrivers: () => {
    // GET /api/v1/drivers (Yêu cầu Token)
    return axiosClient.get("/drivers");
  },

  getAllBuses: () => {
    // GET /api/v1/buses (Yêu cầu Token)
    return axiosClient.get("/buses");
  },

  getSummaryMetrics: () => {
    // GET /api/v1/metrics/summary (Yêu cầu Token)
    // Đây là API giả định để lấy tổng số liệu
    return axiosClient.get("/metrics/summary");
  },
  getLiveBusLocations: () => {
    // GET /api/v1/buses/live-location (Yêu cầu Token)
    // Đây là API giả định để lấy vị trí xe buýt trực tiếp
    return axiosClient.get("/buses/live-location");
  },
};

export default apiServices;
