import axiosClient from "./axiosClient";

const parentApi = {
  getAllParents: () => axiosClient.get("/parents"),
  getParentById: (id) => axiosClient.get(`/parents/${id}`),
  createParent: (data) => axiosClient.post("/parents", data),
  updateParent: (id, data) => axiosClient.put(`/parents/${id}`, data),
  deleteParent: (id) => axiosClient.delete(`/parents/${id}`),
};

export default parentApi;
