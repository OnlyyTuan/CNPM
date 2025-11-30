import axiosClient from './axiosClient';

export const getLocations = async () => {
  const resp = await axiosClient.get('/routes/locations');
  return resp;
};

export const addLocation = async (location) => {
  const resp = await axiosClient.post('/routes/locations', location);
  return resp;
};

export const updateLocation = async (id, location) => {
  const resp = await axiosClient.put(`/routes/locations/${id}`, location);
  return resp;
};

export const deleteLocation = async (id) => {
  const resp = await axiosClient.delete(`/routes/locations/${id}`);
  return resp;
};

export default {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
};
