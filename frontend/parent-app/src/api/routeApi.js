import axiosClient from './axiosClient';

export const getAllRoutes = async () => {
  const resp = await axiosClient.get('/routes');
  // Normalize possible shapes
  if (Array.isArray(resp)) return resp;
  if (resp && Array.isArray(resp.data)) return resp.data;
  return [];
};

export const getRouteWaypoints = async (routeId) => {
  const resp = await axiosClient.get(`/routes/${routeId}/waypoints`);
  return resp;
};

export default {
  getAllRoutes,
  getRouteWaypoints,
};
