import axiosClient from './axiosClient';

const notificationApi = {
  getMyNotifications: () => {
    return axiosClient.get('/notifications');
  }
};

export default notificationApi;
