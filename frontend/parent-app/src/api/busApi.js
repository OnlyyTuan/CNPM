import axiosClient from "./axiosClient";

export const getLiveLocations = () => axiosClient.get("/buses/live-location");
export const getStopsForBus = (busId) => axiosClient.get(`/students/bus/${busId}/stops`);
