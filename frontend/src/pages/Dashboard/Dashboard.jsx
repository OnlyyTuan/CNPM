// frontend/src/pages/Dashboard/Dashboard.jsx
// Trang Dashboard tổng quan cho Admin

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Bus,
  GitBranch,
  Calendar,
  UserCog,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getDashboardData } from "../../api/dashboardApi";
import { getLiveBusLocations } from "../../api/busApi";
import toast from "react-hot-toast";

// Component Card thống kê
const StatCard = ({ icon: Icon, title, value, color, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp size={16} className="mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </div>
  );
};

// Component Loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [liveLocations, setLiveLocations] = useState([]);

  // Màu sắc cho biểu đồ
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Lấy dữ liệu dashboard
  useEffect(() => {
    fetchDashboardData();
    // Bắt đầu polling vị trí xe buýt trực tiếp (≤ 3 giây)
    let canceled = false;
    const fetchLive = async () => {
      try {
        const data = await getLiveBusLocations();
        if (!canceled) {
          // Lọc bỏ bản ghi không có toạ độ
          const cleaned = Array.isArray(data)
            ? data.filter((x) => x && x.lat != null && x.lng != null)
            : [];
          setLiveLocations(cleaned);
        }
      } catch (err) {
        // im lặng để không làm ồn Dashboard nếu endpoint tạm thời lỗi
        // console.debug('live-location error', err);
      }
    };
    fetchLive();
    const intervalId = setInterval(fetchLive, 5000);

    return () => {
      canceled = true;
      clearInterval(intervalId);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  const {
    overview,
    busStatus,
    studentsByRoute,
    scheduleStats,
    recentSchedules,
    driverStatus,
  } = dashboardData;

  // Chuẩn bị dữ liệu cho biểu đồ xe buýt
  const busStatusData = busStatus.map((item) => ({
    name:
      item.status === "ACTIVE"
        ? "Hoạt động"
        : item.status === "MAINTENANCE"
        ? "Bảo trì"
        : "Không hoạt động",
    value: item.count,
  }));

  // Chuẩn bị dữ liệu cho biểu đồ lịch trình
  const scheduleStatusData = scheduleStats.map((item) => ({
    name:
      item.status === "PLANNED"
        ? "Đã lên kế hoạch"
        : item.status === "ONGOING"
        ? "Đang diễn ra"
        : item.status === "COMPLETED"
        ? "Hoàn thành"
        : "Đã hủy",
    value: item.count,
  }));

  // Dữ liệu học sinh theo tuyến (top 5)
  const topRoutes = studentsByRoute.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Tổng quan hệ thống xe buýt học sinh
          </p>
        </div>
        <div>
          <Link
            to="/admin/accounts"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Quản lý Tài khoản
          </Link>
        </div>
      </div>

      {/* Cards thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Tổng số Học sinh"
          value={overview.totalStudents}
          color="bg-blue-500"
        />
        <StatCard
          icon={UserCog}
          title="Tổng số Tài xế"
          value={overview.totalDrivers}
          color="bg-green-500"
        />
        <StatCard
          icon={Bus}
          title="Tổng số Xe buýt"
          value={overview.totalBuses}
          color="bg-orange-500"
        />
        <StatCard
          icon={GitBranch}
          title="Tổng số Tuyến đường"
          value={overview.totalRoutes}
          color="bg-purple-500"
        />
      </div>

      {/* Cards thống kê phụ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={Bus}
          title="Xe đang hoạt động"
          value={overview.activeBuses}
          color="bg-green-600"
          trend={`${Math.round(
            (overview.activeBuses / overview.totalBuses) * 100
          )}% tổng số xe`}
        />
        <StatCard
          icon={Calendar}
          title="Lịch trình hôm nay"
          value={overview.todaySchedules}
          color="bg-blue-600"
        />
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ trạng thái xe buýt */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Trạng thái Xe buýt
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={busStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {busStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ học sinh theo tuyến */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Phân bố Học sinh theo Tuyến
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topRoutes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="route_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="student_count" fill="#3B82F6" name="Số học sinh" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Theo dõi Xe buýt Trực tiếp */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Theo dõi Xe buýt Trực tiếp
        </h3>
        {!liveLocations || liveLocations.length === 0 ? (
          <p className="text-gray-600">
            Chưa có dữ liệu vị trí. Hãy chạy xe hoặc cập nhật vị trí qua API.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xe buýt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vĩ độ (lat)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kinh độ (lng)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tốc độ (km/h)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {liveLocations.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bus.licensePlate || bus.id}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                      {Number(bus.lat).toFixed(5)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                      {Number(bus.lng).toFixed(5)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                      {bus.speed != null ? Number(bus.speed).toFixed(1) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lịch trình gần đây */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Lịch trình gần đây
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xe buýt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tuyến đường
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài xế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.license_plate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {schedule.route_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {schedule.driver_name || "Chưa có"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(schedule.start_time).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        schedule.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : schedule.status === "ONGOING"
                          ? "bg-blue-100 text-blue-800"
                          : schedule.status === "PLANNED"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {schedule.status === "COMPLETED"
                        ? "Hoàn thành"
                        : schedule.status === "ONGOING"
                        ? "Đang diễn ra"
                        : schedule.status === "PLANNED"
                        ? "Đã lên kế hoạch"
                        : "Đã hủy"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
