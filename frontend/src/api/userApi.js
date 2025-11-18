import axiosClient from "./axiosClient";

const userApi = {
  getAllUsers: () => axiosClient.get("/users"),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  updateUser: (id, data) => axiosClient.put(`/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
};

export default userApi;
