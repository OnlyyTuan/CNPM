// frontend/src/api/routeApi.js
// API client cho Tuyến đường

import axios from "axios";
import { API_ENDPOINTS } from "../config/api.config";

const API_URL = API_ENDPOINTS.ROUTES;

// Lấy tất cả tuyến đường
export const getAllRoutes = async () => {
  const resp = await axios.get(API_URL);
  const response = resp.data;
  // Trả về dữ liệu tuyến đường theo các dạng thường gặp:
  // - mảng trực tiếp
  // - { success, data: [...] }
  let arr = [];
  if (Array.isArray(response)) {
    arr = response;
  } else if (response && Array.isArray(response.data)) {
    arr = response.data;
  }

  // Normalize shape to use frontend-friendly keys: route_name, estimated_duration, distance
  if (Array.isArray(arr) && arr.length > 0) {
    return arr.map((r) => ({
      ...r,
      id: r.id,
      route_name: r.routeName || r.route_name || r.name || "",
      distance:
        r.distance != null
          ? Number(r.distance)
          : r.dist != null
          ? Number(r.dist)
          : 0,
      estimated_duration:
        r.estimatedDuration != null
          ? Number(r.estimatedDuration)
          : r.estimated_duration != null
          ? Number(r.estimated_duration)
          : 0,
    }));
  }

  // Nếu không có dữ liệu hợp lệ, trả về mảng fallback mặc định
  return [
    {
      id: "R001",
      route_name: "Tuyến 1: Trung tâm - Quận 9",
      distance: 15.5,
      estimated_duration: 45,
    },
    {
      id: "R002",
      route_name: "Tuyến 2: Bình Thạnh - Thủ Đức",
      distance: 12.3,
      estimated_duration: 35,
    },
  ];
};

// Lấy tuyến đường theo ID
export const getRouteById = async (id) => {
  const resp = await axios.get(`${API_URL}/${id}`);
  const r = resp.data;
  const data = r && r.data ? r.data : r;
  if (!data) return data;
  return {
    ...data,
    id: data.id,
    route_name: data.routeName || data.route_name || data.name || "",
    distance:
      data.distance != null
        ? Number(data.distance)
        : data.dist != null
        ? Number(data.dist)
        : 0,
    estimated_duration:
      data.estimatedDuration != null
        ? Number(data.estimatedDuration)
        : data.estimated_duration != null
        ? Number(data.estimated_duration)
        : 0,
  };
};

// Xóa tuyến đường theo ID
export const deleteRoute = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Cập nhật tuyến đường theo ID
export const updateRoute = async (id, payload) => {
  // Normalize payload keys to backend model (routeName, estimatedDuration)
  const body = {
    ...(payload.route_name ? { routeName: payload.route_name } : {}),
    ...(payload.routeName ? { routeName: payload.routeName } : {}),
    distance: payload.distance != null ? Number(payload.distance) : undefined,
    estimatedDuration:
      payload.estimated_duration != null
        ? Number(payload.estimated_duration)
        : payload.estimatedDuration != null
        ? Number(payload.estimatedDuration)
        : undefined,
  };
  const response = await axios.put(`${API_URL}/${id}`, body);
  return response.data;
};

// Lấy waypoints của route (cho vẽ lộ trình trên bản đồ)
export const getRouteWaypoints = async (routeId) => {
  const response = await axios.get(`${API_URL}/${routeId}/waypoints`);
  return response.data;
};
