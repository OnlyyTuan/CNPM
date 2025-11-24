import axiosClient from "./axiosClient";

export const getSelfDetail = () => axiosClient.get("/parents/me");
export const getStudentDetail = (id) => axiosClient.get(`/parents/students/${id}`);
