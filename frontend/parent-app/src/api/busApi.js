import axiosClient from './axiosClient';

// Lấy vị trí xe đang chạy (realtime - polling)
export const getLiveBusLocations = async () => {
  // axiosClient trả về response.data theo interceptor
  const resp = await axiosClient.get('/buses/live-location');
  return resp;
};

export default {
  getLiveBusLocations,
};
