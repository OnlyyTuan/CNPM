import axiosClient from "./axiosClient";

export const getRouteWaypoints = (routeId) => axiosClient.get(`/routes/${routeId}/waypoints`);
