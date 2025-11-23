// frontend/src/api/studentApi.js
// API client cho Students

import axiosClient from "./axiosClient";

// Students API
export const getAllStudents = async () => {
  const response = await axiosClient.get("/students");
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await axiosClient.get(`/students/${id}`);
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await axiosClient.post("/students", studentData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await axiosClient.put(`/students/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await axiosClient.delete(`/students/${id}`);
  return response.data;
};

export const getStudentsByBusId = async (busId) => {
  const response = await axiosClient.get(`/students/by-bus/${busId}`);
  return response.data;
};