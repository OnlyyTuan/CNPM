import axiosClient from "./axiosClient";

const notificationApi = {
  getMyNotifications: async () => {
    const response = await axiosClient.get("/notifications");
    return response.data;
  },
  sendToBus: async (data) => {
    const response = await axiosClient.post("/notifications/send-to-bus", data);
    return response.data;
  },
};

export default notificationApi;