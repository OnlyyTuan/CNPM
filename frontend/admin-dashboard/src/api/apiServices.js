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

  createStudent: (studentData) => {
    // POST /api/v1/students
    return axiosClient.post("/students", studentData);
  },

  updateStudent: (id, studentData) => {
    // PUT /api/v1/students/:id
    return axiosClient.put(`/students/${id}`, studentData);
  },

  deleteStudent: (id) => {
    // DELETE /api/v1/students/:id
    return axiosClient.delete(`/students/${id}`);
  },

  getAllDrivers: () => {
    // GET /api/v1/drivers (Yêu cầu Token)
    return axiosClient.get("/drivers");
  },

  createDriver: (driverData) => {
    // POST /api/v1/drivers
    return axiosClient.post("/drivers", driverData);
  },

  updateDriver: (id, driverData) => {
    // PUT /api/v1/drivers/:id
    return axiosClient.put(`/drivers/${id}`, driverData);
  },

  deleteDriver: (id) => {
    // DELETE /api/v1/drivers/:id
    return axiosClient.delete(`/drivers/${id}`);
  },

  getAllBuses: () => {
    // GET /api/v1/buses (Yêu cầu Token)
    return axiosClient.get("/buses");
  },

  createBus: (busData) => {
    // POST /api/v1/buses
    return axiosClient.post("/buses", busData);
  },

  updateBus: (id, busData) => {
    // PUT /api/v1/buses/:id
    return axiosClient.put(`/buses/${id}`, busData);
  },

  deleteBus: (id) => {
    // DELETE /api/v1/buses/:id
    return axiosClient.delete(`/buses/${id}`);
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

  // ------------------------------------------------------------------
  // FEATURE FLAGS
  // ------------------------------------------------------------------
  getFeatureFlags: () => {
    // GET /api/v1/feature-flags (Công khai)
    return axiosClient.get("/feature-flags");
  },
};

export default apiServices;
