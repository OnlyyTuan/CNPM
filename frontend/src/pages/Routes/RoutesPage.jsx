// frontend/src/pages/Routes/RoutesPage.jsx
// Trang quản lý danh sách Tuyến đường

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, GitBranch, MapPin, Navigation, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { getAllRoutes, getRouteWaypoints } from "../../api/routeApi";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api.config";

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [waypointCounts, setWaypointCounts] = useState({}); // {routeId: count}
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showWaypointsModal, setShowWaypointsModal] = useState(false);
  const [routeWaypoints, setRouteWaypoints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Listen for global updates (e.g., after editing a route) and refresh list
  useEffect(() => {
    const handler = () => {
      fetchRoutes();
    };
    window.addEventListener("routes:updated", handler);
    return () => window.removeEventListener("routes:updated", handler);
  }, []);

  useEffect(() => {
    // Tìm kiếm tuyến đường
    const term = String(searchTerm || "").toLowerCase();
    const filtered = routes.filter((route) => {
      const nameVal = (route && (route.route_name || route.name)) || "";
      const name = String(nameVal).toLowerCase();
      const idStr = String((route && route.id) || "").toLowerCase();
      return name.includes(term) || idStr.includes(term);
    });
    setFilteredRoutes(filtered);
  }, [searchTerm, routes]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await getAllRoutes();
      // getAllRoutes already normalizes shapes and returns an array or fallback
      const routesData = Array.isArray(response) ? response : [];

      if (!routesData || routesData.length === 0) {
        // Fallback mock routes
        const fallback = [
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
        setRoutes(fallback);
        setFilteredRoutes(fallback);
      } else {
        setRoutes(routesData);
        setFilteredRoutes(routesData);
        
        // Load waypoint counts for each route
        routesData.forEach(async (route) => {
          try {
            const waypoints = await getRouteWaypoints(route.id);
            setWaypointCounts(prev => ({
              ...prev,
              [route.id]: Array.isArray(waypoints) ? waypoints.length : 0
            }));
          } catch (error) {
            console.error(`Lỗi tải waypoints cho tuyến ${route.id}:`, error);
          }
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tuyến đường:", error);
      toast.error("Không thể tải danh sách tuyến đường");
      // Mock data for development
      const mockData = [
        {
          id: "1",
          route_name: "Tuyến 1: Trung tâm - Quận 9",
          distance: 15.5,
          estimated_duration: 45,
        },
        {
          id: "2",
          route_name: "Tuyến 2: Bình Thạnh - Thủ Đức",
          distance: 12.3,
          estimated_duration: 35,
        },
      ];
      setRoutes(mockData);
      setFilteredRoutes(mockData);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Tạo danh sách hiển thị: mỗi tuyến hiện 2 biến thể Sáng và Tối
  // Thêm thuộc tính `display_name` để an toàn hiển thị cả khi API trả `name` thay vì `route_name`.
  const displayRoutes = filteredRoutes.flatMap((r) => {
    const baseName = (r && (r.route_name || r.name)) || "";
    return [
      { ...r, id: `${r.id}-morning`, display_name: `${baseName} - Sáng` },
      { ...r, id: `${r.id}-evening`, display_name: `${baseName} - Tối` },
    ];
  });

  // Handlers: Edit / Delete
  const handleEdit = (displayId) => {
    if (!displayId) return;
    const baseId = String(displayId).split("-")[0];
    // navigate to edit page (adjust path if your app uses a different route)
    navigate(`/admin/routes/edit/${baseId}`);
  };

  const handleDelete = async (displayId) => {
    if (!displayId) return;
    const baseId = String(displayId).split("-")[0];
    const confirmed = window.confirm("Bạn có chắc muốn xóa tuyến này?");
    if (!confirmed) return;

    try {
      setLoading(true);
      // Call backend DELETE endpoint. Use API_ENDPOINTS.ROUTES from config.
      await axios.delete(`${API_ENDPOINTS.ROUTES}/${baseId}`);
      // Remove from state
      setRoutes((prev) => prev.filter((r) => String(r.id) !== String(baseId)));
      setFilteredRoutes((prev) =>
        prev.filter((r) => String(r.id) !== String(baseId))
      );
      toast.success("Xóa tuyến đường thành công");
    } catch (error) {
      console.error("Lỗi xóa tuyến:", error);
      toast.error("Xóa tuyến thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Thống kê tính trên danh sách tuyến gốc (không nhân đôi bởi biến thể Sáng/Tối)
  const baseRoutes = filteredRoutes || [];
  const totalRoutesCount = baseRoutes.length;
  // Ensure numeric calculations: API may return distances/durations as strings
  const totalDistance = baseRoutes.reduce((sum, r) => {
    const d = Number(r.distance);
    return sum + (Number.isFinite(d) ? d : 0);
  }, 0);

  const totalDuration = baseRoutes.reduce((sum, r) => {
    const t = Number(r.estimated_duration);
    return sum + (Number.isFinite(t) ? t : 0);
  }, 0);

  const avgDuration =
    totalRoutesCount > 0 ? Math.round(totalDuration / totalRoutesCount) : 0;

  const handleViewWaypoints = async (routeId) => {
    const baseId = String(routeId).split('-')[0];
    try {
      setLoading(true);
      const data = await getRouteWaypoints(baseId);
      
      // Backend trả về: { routeId, routeName, waypoints: [...] }
      const waypointsList = data.waypoints || data || [];
      
      setRouteWaypoints(Array.isArray(waypointsList) ? waypointsList : []);
      setSelectedRoute(routes.find(r => r.id === baseId));
      setShowWaypointsModal(true);
    } catch (error) {
      console.error('Lỗi khi tải waypoints:', error);
      toast.error('Không thể tải danh sách điểm dừng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Quản lý Tuyến đường
          </h2>
          <p className="text-gray-600 mt-1">
            Danh sách tất cả tuyến đường trong hệ thống
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/live')}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Navigation size={20} />
          <span>Xem vị trí xe</span>
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
            placeholder="Tìm kiếm theo tên tuyến hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tổng số tuyến</p>
          <p className="text-2xl font-bold text-blue-600">{totalRoutesCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tổng quãng đường</p>
          <p className="text-2xl font-bold text-green-600">
            {totalDistance.toFixed(1)} km
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Thời gian trung bình</p>
          <p className="text-2xl font-bold text-orange-600">
            {avgDuration} phút
          </p>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayRoutes.map((route) => (
          <div
            key={route.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <GitBranch size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {route.display_name ||
                        route.route_name ||
                        route.name ||
                        "(Không có tên)"}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {route.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span>
                    Quãng đường:{" "}
                    <strong className="text-gray-900">
                      {route.distance || "N/A"} km
                    </strong>
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Thời gian:{" "}
                    <strong className="text-gray-900">
                      {route.estimated_duration || "N/A"} phút
                    </strong>
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Navigation size={16} className="mr-2 text-gray-400" />
                  <span>
                    Điểm dừng:{" "}
                    <button
                      onClick={() => handleViewWaypoints(route.id)}
                      className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {waypointCounts[route.id.split('-')[0]] || '-'} điểm
                    </button>
                  </span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => handleEdit(route.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit size={16} />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => navigate('/admin/live')}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  title="Xem vị trí xe trên tuyến này"
                >
                  <Eye size={16} />
                  <span>Xe</span>
                </button>
                <button
                  onClick={() => handleDelete(route.id)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <GitBranch size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Không tìm thấy tuyến đường nào</p>
        </div>
      )}

      {/* Waypoints Modal */}
      {showWaypointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Điểm dừng - {selectedRoute?.route_name || selectedRoute?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Tổng cộng {routeWaypoints.length} điểm dừng
                  </p>
                </div>
                <button
                  onClick={() => setShowWaypointsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {routeWaypoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Chưa có điểm dừng nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {routeWaypoints.map((waypoint, index) => (
                    <div
                      key={waypoint.id || index}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {waypoint.stop_name || waypoint.name || waypoint.location_name || 'Điểm trung gian'}
                        </h4>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <p className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            Lat: {Number(waypoint.latitude).toFixed(6)}, 
                            Lng: {Number(waypoint.longitude).toFixed(6)}
                          </p>
                          {(waypoint.sequence_order != null || waypoint.sequence != null) && (
                            <p className="text-xs text-gray-500">
                              Thứ tự: {waypoint.sequence_order || waypoint.sequence}
                            </p>
                          )}
                          {(waypoint.is_stop === 1 || waypoint.is_stop === true) && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              🚏 Điểm dừng
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowWaypointsModal(false)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
