import axios from 'axios';
const API_URL = 'http://localhost:3000';

export const getLocations = async () => {
  const res = await axios.get(`${API_URL}/locations`);
  return res.data;
}

export const addLocation = async (location) => {
  const res = await axios.post(`${API_URL}/locations`, location);
  return res.data;
}

export const updateLocation = async (id, location) => {
  const res = await axios.put(`${API_URL}/locations/${id}`, location);
  return res.data;
}

export const deleteLocation = async (id) => {
  const res = await axios.delete(`${API_URL}/locations/${id}`);
  return res.data;
}
