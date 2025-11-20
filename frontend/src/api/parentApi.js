import axiosClient from "./axiosClient";

const parentApi = {
  getAllParents: () => axiosClient.get("/parents"),
  getParentById: (id) => axiosClient.get(`/parents/${id}`),
  createParent: (data) => axiosClient.post("/parents", data),
  updateParent: (id, data) => axiosClient.put(`/parents/${id}`, data),
  deleteParent: (id) => axiosClient.delete(`/parents/${id}`),
  // Create a Parent record linked to an existing User
  linkParentToUser: (userId, parentData) =>
    axiosClient.post(`/parents/link`, { userId, parentData }),
};

export default parentApi;
