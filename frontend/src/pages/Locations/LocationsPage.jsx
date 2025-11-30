// frontend/src/pages/Locations/LocationsPage.jsx
// Trang quản lý điểm dừng

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, MapPin, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api.config";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import RoutingPolyline from "../../components/RoutingPolyline";

// Fix Leaflet default icon
const DefaultIcon = L.icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [mapPosition, setMapPosition] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (showModal) {
      fetchRoutes();
    }
  }, [showModal]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = locations.filter(
      (loc) =>
        loc.name?.toLowerCase().includes(term) ||
        loc.address?.toLowerCase().includes(term) ||
        loc.id?.toLowerCase().includes(term)
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.ROUTES}/locations`);
      const data = response.data;
      setLocations(Array.isArray(data) ? data : []);
      setFilteredLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách điểm dừng:", error);
      toast.error("Không thể tải danh sách điểm dừng");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.ROUTES}`);
      const allRoutes = response.data;
      
      if (!Array.isArray(allRoutes)) {
        console.error("Routes data is not an array");
        return;
      }
      
      // Show up to 3 current routes on the map to help placing stops.
      // If specific route IDs are required, update this logic accordingly.
      // We fetch all routes and waypoints, then select which to display.
      const all = Array.isArray(allRoutes) ? allRoutes : [];

      const routesWithWaypoints = await Promise.all(
        all.map(async (route) => {
          try {
            const waypointsRes = await axios.get(`${API_ENDPOINTS.ROUTES}/${route.id}/waypoints`);
            const data = waypointsRes.data;
            
            return {
              ...route,
              waypoints: data.waypoints || []
            };
          } catch (err) {
            console.error(`Lỗi khi tải waypoints cho ${route.id}:`, err);
            return { ...route, waypoints: [] };
          }
        })
      );
      setRoutes(routesWithWaypoints);

      // By default select up to 3 newest routes (assume API returns in creation order)
      const defaultSelected = (routesWithWaypoints.length > 3)
        ? routesWithWaypoints.slice(-3).map(r => r.id)
        : routesWithWaypoints.map(r => r.id);
      setSelectedRouteIds(defaultSelected);
    } catch (error) {
      console.error("Lỗi khi tải tuyến đường:", error);
      setRoutes([]);
    }
  };

  const handleOpenModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      setFormData({
        name: location.name || "",
        address: location.address || "",
        latitude: location.latitude || "",
        longitude: location.longitude || "",
      });
      setMapPosition(lat && lng ? { lat, lng } : { lat: 10.762622, lng: 106.660172 });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
      });
      setMapPosition({ lat: 10.762622, lng: 106.660172 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setMapPosition(null);
    setFormData({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update form when map is clicked
  useEffect(() => {
    if (mapPosition) {
      setFormData((prev) => ({
        ...prev,
        latitude: mapPosition.lat.toFixed(6),
        longitude: mapPosition.lng.toFixed(6),
      }));
    }
  }, [mapPosition]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        type: "stop",
      };

      if (editingLocation) {
        await axios.put(`${API_ENDPOINTS.ROUTES}/locations/${editingLocation.id}`, payload);
        toast.success("Cập nhật điểm dừng thành công");
      } else {
        await axios.post(`${API_ENDPOINTS.ROUTES}/locations`, payload);
        toast.success("Thêm điểm dừng thành công");
      }

      handleCloseModal();
      fetchLocations();
    } catch (error) {
      console.error("Lỗi khi lưu điểm dừng:", error);
      toast.error(editingLocation ? "Không thể cập nhật điểm dừng" : "Không thể thêm điểm dừng");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa điểm dừng này?")) {
      return;
    }

    try {
      await axios.delete(`${API_ENDPOINTS.ROUTES}/locations/${id}`);
      toast.success("Xóa điểm dừng thành công");
      fetchLocations();
    } catch (error) {
      console.error("Lỗi khi xóa điểm dừng:", error);
      toast.error("Không thể xóa điểm dừng");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý điểm dừng</h2>
          <p className="text-gray-600 mt-1">
            Tổng số {filteredLocations.length} điểm dừng
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Thêm điểm dừng</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã điểm dừng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên điểm dừng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tọa độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocations.map((location) => (
                <tr key={location.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {location.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {location.name || "Không có tên"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {location.type || "stop"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {location.address || "Chưa có địa chỉ"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Lat: {Number(location.latitude).toFixed(6)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Lng: {Number(location.longitude).toFixed(6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(location)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Không tìm thấy điểm dừng nào</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingLocation ? "Sửa điểm dừng" : "Thêm điểm dừng mới"}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Form bên trái */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã điểm dừng
                    </label>
                    <input
                      type="text"
                      value={editingLocation?.id || 'Tự động tạo'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên điểm dừng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Bến xe Miền Đông"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vĩ độ (Latitude) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bấm vào bản đồ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kinh độ (Longitude) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bấm vào bản đồ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 1 Phạm Ngũ Lão, Quận 1"
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      {editingLocation ? "Cập nhật" : "Thêm mới"}
                    </button>
                  </div>
                </form>

                {/* Map bên phải */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Vị trí trên bản đồ
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Nhấp vào bản đồ để chọn vị trí điểm dừng
                  </p>
                  <div className="h-[500px] rounded-lg overflow-hidden border-2 border-gray-300">
                    <MapContainer
                      center={[mapPosition?.lat || 10.762622, mapPosition?.lng || 106.660172]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Hiển thị tuyến đường R001 và R002 */}
                      {Array.isArray(routes) && routes.filter(r => selectedRouteIds.includes(r.id)).map((route) => {
                        try {
                          if (!route || !route.waypoints || route.waypoints.length < 2) return null;
                          
                          const positions = route.waypoints
                            .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                            .map(wp => [parseFloat(wp.latitude), parseFloat(wp.longitude)])
                            .filter(pos => !isNaN(pos[0]) && !isNaN(pos[1]));

                          if (positions.length < 2) return null;

                          // Pick a distinct color per route (up to 3)
                          const colors = ['#3B82F6', '#10B981', '#F59E0B'];
                          const displayed = routes.filter(r => selectedRouteIds.includes(r.id));
                          const idx = Math.min(2, displayed.findIndex(r => r.id === route.id));
                          const color = colors[idx] || '#3B82F6';

                          // Use RoutingPolyline which calls OSRM to draw driving route
                          return (
                            <RoutingPolyline
                              key={route.id}
                              waypoints={route.waypoints}
                              color={color}
                              routeName={`${route.id} - ${route.name || ''}`}
                            />
                          );
                        } catch (err) {
                          console.error("Error rendering route:", err);
                          return null;
                        }
                      })}
                      
                      <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                    </MapContainer>
                  </div>
                  
                  {/* Legend */}
                      {routes.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Tuyến đường (chọn để hiển thị):</p>
                      <div className="grid grid-cols-1 gap-2">
                        {routes.map((route, i) => {
                          const checked = selectedRouteIds.includes(route.id);
                          return (
                            <label key={route.id} className="flex items-center space-x-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedRouteIds(prev => {
                                    if (prev.includes(route.id)) return prev.filter(id => id !== route.id);
                                    return [...prev, route.id];
                                  });
                                }}
                                className="w-4 h-4"
                              />
                              <span className="ml-1">{route.id} - {route.name || 'Không tên'}</span>
                            </label>
                          );
                        })}
                      </div>
                      {/* Legend */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Chú giải:</p>
                        {routes.filter(r => selectedRouteIds.includes(r.id)).map((route, idx) => {
                          const colors = ['#3B82F6', '#10B981', '#F59E0B'];
                          const color = colors[idx] || colors[0];
                          return (
                            <div key={route.id} className="flex items-center space-x-2 text-xs text-gray-600">
                              <div className="w-8 h-1 rounded" style={{ backgroundColor: color }} />
                              <span>{route.id} - {route.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;
