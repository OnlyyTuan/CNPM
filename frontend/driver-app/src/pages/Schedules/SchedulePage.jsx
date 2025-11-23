// frontend/src/pages/Schedules/SchedulePage.jsx
// Trang quản lý Lịch trình xe buýt với Calendar

import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Plus, Edit, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  getAllSchedules,
  getMySchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../../api/scheduleApi";
import { getAllAssignments } from "../../api/assignmentApi";
import useAuthStore from "../../hooks/useAuthStore";

// Cấu hình localizer cho calendar
const locales = {
  vi: vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Component Modal cho thêm/sửa lịch trình
const ScheduleModal = ({
  isOpen,
  onClose,
  schedule,
  onSave,
  buses,
  routes,
  assignments = [],
}) => {
  const [formData, setFormData] = useState({
    bus_id: "",
    route_id: "",
    start_time: "",
    end_time: "",
    status: "PLANNED",
  });

  const [useAssignment, setUseAssignment] = useState(
    !!assignments && assignments.length === 1
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  useEffect(() => {
    if (schedule) {
      setFormData({
        bus_id: schedule.bus_id || "",
        route_id: schedule.route_id || "",
        start_time: schedule.start_time
          ? new Date(schedule.start_time).toISOString().slice(0, 16)
          : "",
        end_time: schedule.end_time
          ? new Date(schedule.end_time).toISOString().slice(0, 16)
          : "",
        status: schedule.status || "PLANNED",
      });
    } else {
      setFormData({
        bus_id: "",
        route_id: "",
        start_time: "",
        end_time: "",
        status: "PLANNED",
      });
      // default assignment selection when creating new schedule
      if (assignments && assignments.length === 1) {
        const a = assignments[0];
        setSelectedAssignmentId(a.bus_id || a.busId || a.bus_id);
        setUseAssignment(true);
        setFormData((s) => ({
          ...s,
          bus_id: a.bus_id || a.busId || a.bus_id,
          route_id: a.route_id || a.routeId || a.route_id,
        }));
      } else {
        setSelectedAssignmentId("");
        setUseAssignment(false);
      }
    }
  }, [schedule]);

  useEffect(() => {
    // when assignments prop changes, if only one assignment available, default to it
    if (!schedule) {
      if (assignments && assignments.length === 1) {
        const a = assignments[0];
        setSelectedAssignmentId(a.bus_id || a.busId || a.id || "");
        setUseAssignment(true);
        setFormData((s) => ({
          ...s,
          bus_id: a.bus_id || a.busId || a.id,
          route_id: a.route_id || a.routeId || a.route_id,
        }));
      }
    }
  }, [assignments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {schedule ? "Sửa Lịch trình" : "Thêm Lịch trình mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nếu có phân công sẵn, cho chọn phân công để tiền điền bus+route */}
          {assignments && assignments.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dùng phân công hiện có
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => {
                    const sel = e.target.value;
                    setSelectedAssignmentId(sel);
                    setUseAssignment(!!sel);
                    // find assignment and set formData
                    const a = assignments.find(
                      (x) => String(x.bus_id || x.busId || x.id) === String(sel)
                    );
                    if (a) {
                      setFormData((s) => ({
                        ...s,
                        bus_id: a.bus_id || a.busId || a.id,
                        route_id: a.route_id || a.routeId || a.route_id,
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn phân công (tùy chọn) --</option>
                  {assignments.map((a) => (
                    <option
                      key={a.bus_id || a.id}
                      value={a.bus_id || a.busId || a.id}
                    >
                      {a.license_plate ||
                        a.bus_license ||
                        `${a.bus_id || a.id}`}{" "}
                      - {a.route_name || a.route_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    // clear assignment selection to allow manual pick
                    setSelectedAssignmentId("");
                    setUseAssignment(false);
                    setFormData((s) => ({ ...s, bus_id: "", route_id: "" }));
                  }}
                  className="px-3 py-2 border rounded text-sm"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          ) : null}

          {/* Chọn xe buýt (ẩn khi dùng phân công) */}
          {!useAssignment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xe buýt <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bus_id}
                onChange={(e) =>
                  setFormData({ ...formData, bus_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn xe buýt</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.license_plate} - {bus.capacity} chỗ
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chọn tuyến đường (ẩn khi dùng phân công) */}
          {!useAssignment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tuyến đường <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.route_id}
                onChange={(e) =>
                  setFormData({ ...formData, route_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn tuyến đường</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.route_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Thời gian bắt đầu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) =>
                setFormData({ ...formData, start_time: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Thời gian kết thúc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) =>
                setFormData({ ...formData, end_time: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PLANNED">Đã lên kế hoạch</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELED">Đã hủy</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {schedule ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component Modal xác nhận xóa
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn xóa lịch trình này không? Hành động này không
          thể hoàn tác.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [allSchedulesCount, setAllSchedulesCount] = useState(null);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy schedules của tài xế đang đăng nhập từ server
      const mySchedulesRes = await getMySchedules();
      const schedulesData =
        mySchedulesRes && mySchedulesRes.success ? mySchedulesRes.data : [];
      setAllSchedulesCount(
        Array.isArray(schedulesData) ? schedulesData.length : 0
      );

      // Lấy buses từ API nếu có
      try {
        const busesRes = await import("../../api/busApi").then((m) =>
          m.getAllBuses()
        );
        // busApi returns response shape similar to { success, data } or an array
        const busesData = Array.isArray(busesRes)
          ? busesRes
          : busesRes?.data || busesRes?.data?.data || [];
        if (Array.isArray(busesData) && busesData.length > 0) {
          setBuses(busesData);
        }
      } catch (err) {
        // fallback: keep existing mock if API fails
        console.warn("Lấy buses từ API thất bại, dùng dữ liệu mẫu", err);
        setBuses([
          { id: "1", license_plate: "29A-12345", capacity: 45 },
          { id: "2", license_plate: "29B-67890", capacity: 40 },
        ]);
      }

      // Lấy routes từ API (sử dụng routeApi.getAllRoutes để normalize)
      try {
        const routesModule = await import("../../api/routeApi");
        const routesRes = await routesModule.getAllRoutes();
        // getAllRoutes already returns an array of normalized routes
        if (Array.isArray(routesRes) && routesRes.length > 0) {
          setRoutes(routesRes);
        }
        // Lấy các phân công hiện tại để tiền điền khi tạo lịch
        try {
          const assignRes = await getAllAssignments();
          const assignData = Array.isArray(assignRes)
            ? assignRes
            : assignRes?.data || assignRes?.data?.data || [];
          if (Array.isArray(assignData)) setAssignments(assignData);

          // Server đã trả lịch cho tài xế (nếu backend chưa hỗ trợ, schedulesData sẽ rỗng)
          console.debug(
            "[SchedulePage] fetched my schedules:",
            schedulesData.length
          );
          if (Array.isArray(schedulesData)) setSchedules(schedulesData);
        } catch (err) {
          console.warn("Không thể lấy phân công hiện tại", err);
          // still attempt to filter using empty assignments
          try {
            const authUser = useAuthStore.getState().user;
            console.debug(
              "[SchedulePage] authUser (no assignments):",
              authUser
            );
            const filtered = filterSchedulesForDriver(
              schedulesData,
              [],
              authUser
            );
            console.debug(
              "[SchedulePage] filtered schedules (no assignments):",
              filtered.length
            );
            setSchedules(filtered);
          } catch (e) {
            setSchedules(schedulesData);
          }
        }
      } catch (err) {
        console.warn("Lấy routes từ API thất bại, dùng dữ liệu mẫu", err);
        setRoutes([
          { id: "R001", route_name: "Tuyến 1: Trung tâm - Quận 9" },
          { id: "R002", route_name: "Tuyến 2: Bình Thạnh - Thủ Đức" },
        ]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lọc lịch trình chỉ cho tài xế đang đăng nhập
  const filterSchedulesForDriver = (
    schedulesArr = [],
    assignmentsArr = [],
    authUser,
    busesArr = []
  ) => {
    if (!authUser) return [];

    // Tìm tất cả bus_id được phân công cho driver này
    const driverId =
      authUser.id || authUser.driver_id || authUser.driverId || null;
    const busIds = new Set();
    assignmentsArr.forEach((a) => {
      const aDriver =
        a.driver_id || a.driverId || (a.driver && a.driver.id) || null;
      const aBus = a.bus_id || a.busId || (a.bus && a.bus.id) || null;
      if (aDriver && String(aDriver) === String(driverId) && aBus)
        busIds.add(String(aBus));
    });

    // Nếu tìm được busIds từ phân công, lọc theo bus_id
    if (busIds.size > 0) {
      return schedulesArr.filter((s) => busIds.has(String(s.bus_id)));
    }

    // Nếu không có phân công nhưng API buses trả về thông tin driver trên bus, lọc theo bus.driver_id
    if (Array.isArray(busesArr) && busesArr.length > 0) {
      const busDriverMap = new Map();
      busesArr.forEach((b) => {
        if (b && (b.id || b.id === 0))
          busDriverMap.set(
            String(b.id),
            b.driver_id || b.driverId || b.driver || null
          );
      });
      const driverId =
        authUser.id || authUser.driver_id || authUser.driverId || null;
      if (driverId) {
        const filteredByBus = schedulesArr.filter((s) => {
          const bid = s.bus_id || s.busId || s.bus_id;
          return (
            bid && String(busDriverMap.get(String(bid))) === String(driverId)
          );
        });
        if (filteredByBus.length > 0) return filteredByBus;
      }
    }

    // Fallback: nếu backend trả về driver_name trong schedule, so sánh với tên người dùng
    const name = (
      authUser.full_name ||
      authUser.fullName ||
      authUser.name ||
      ""
    )
      .toString()
      .toLowerCase();
    if (name) {
      return schedulesArr.filter((s) => {
        const dname = (s.driver_name || s.driverName || "")
          .toString()
          .toLowerCase();
        return dname && dname === name;
      });
    }

    // Nếu không có thông tin nào để lọc, trả về rỗng (driver không có lịch)
    return [];
  };

  // Chuyển đổi schedules thành events cho calendar
  const events = schedules.map((schedule) => ({
    id: schedule.id,
    title: `${schedule.license_plate} - ${schedule.route_name}`,
    start: new Date(schedule.start_time),
    end: new Date(schedule.end_time),
    resource: schedule,
  }));

  // Xử lý thêm lịch trình mới
  const handleAddSchedule = () => {
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  // Xử lý xem chi tiết lịch khi click event
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewSchedule, setViewSchedule] = useState(null);

  const handleViewEvent = (event) => {
    const schedule = event.resource || event;
    setViewSchedule(schedule);
    setViewModalOpen(true);
  };

  // Xử lý sửa lịch trình
  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setModalOpen(true);
  };

  // Xử lý xóa lịch trình
  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteSchedule(scheduleToDelete.id);
      if (response.success) {
        toast.success("Xóa lịch trình thành công");
        fetchData();
      }
    } catch (error) {
      console.error("Lỗi khi xóa lịch trình:", error);
      toast.error(error.response?.data?.message || "Không thể xóa lịch trình");
    } finally {
      setDeleteModalOpen(false);
      setScheduleToDelete(null);
    }
  };

  // Xử lý lưu lịch trình
  const handleSaveSchedule = async (formData) => {
    try {
      if (selectedSchedule) {
        // Cập nhật
        const response = await updateSchedule(selectedSchedule.id, formData);
        if (response.success) {
          toast.success("Cập nhật lịch trình thành công");
          fetchData();
        }
      } else {
        // Thêm mới
        const response = await createSchedule(formData);
        if (response.success) {
          toast.success("Thêm lịch trình thành công");
          fetchData();
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu lịch trình:", error);
      toast.error(error.response?.data?.message || "Không thể lưu lịch trình");
    }
  };

  // Custom Event Component (read-only for driver)
  const EventComponent = ({ event }) => {
    const schedule = event.resource;
    return (
      <div className="text-xs">
        <div className="font-semibold">{event.title}</div>
        {schedule.route_name && (
          <div className="text-gray-600 text-xs">{schedule.route_name}</div>
        )}
        {schedule.license_plate && (
          <div className="text-gray-500 text-xs">{schedule.license_plate}</div>
        )}
      </div>
    );
  };

  // Modal read-only xem chi tiết lịch trình
  const ViewScheduleModal = ({ isOpen, onClose, schedule }) => {
    if (!isOpen || !schedule) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Chi tiết lịch trình
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              Đóng
            </button>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>Xe:</strong>{" "}
              {schedule.license_plate || schedule.bus_id || "Chưa gán"}
            </div>
            <div>
              <strong>Tuyến:</strong>{" "}
              {schedule.route_name || schedule.route_id || "Chưa gán"}
            </div>
            <div>
              <strong>Thời gian bắt đầu:</strong>{" "}
              {schedule.start_time
                ? new Date(schedule.start_time).toLocaleString("vi-VN")
                : "-"}
            </div>
            <div>
              <strong>Thời gian kết thúc:</strong>{" "}
              {schedule.end_time
                ? new Date(schedule.end_time).toLocaleString("vi-VN")
                : "-"}
            </div>
            <div>
              <strong>Tài xế:</strong> {schedule.driver_name || "-"}{" "}
              {schedule.driver_phone ? `(${schedule.driver_phone})` : ""}
            </div>
            <div>
              <strong>Trạng thái:</strong> {schedule.status || "-"}
            </div>
            {schedule.notes && (
              <div>
                <strong>Ghi chú:</strong> {schedule.notes}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
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
          <h2 className="text-3xl font-bold text-gray-900">
            Lịch trình của tôi
          </h2>
          <p className="text-gray-600 mt-1">
            Xem lịch trình xe buýt được phân công
          </p>
          <div className="text-sm text-gray-500 mt-1">
            Debug: tổng {allSchedulesCount ?? "-"} lịch, phân công{" "}
            {assignments.length} kết quả, đang hiển thị {schedules.length}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div
        className="bg-white rounded-xl shadow-md p-6"
        style={{ height: "700px" }}
      >
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleViewEvent}
          culture="vi"
          messages={{
            next: "Sau",
            previous: "Trước",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            agenda: "Lịch trình",
            date: "Ngày",
            time: "Thời gian",
            event: "Sự kiện",
          }}
          components={{
            event: EventComponent,
          }}
        />
        {viewModalOpen && viewSchedule && (
          <ViewScheduleModal
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            schedule={viewSchedule}
          />
        )}

        {/* Fallback UI: if calendar has no events but there are assignments, show details */}
        {events.length === 0 && assignments && assignments.length > 0 && (
          <div className="mt-6 p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Bạn chưa có lịch chi tiết — phân công hiện tại
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Quản trị viên đã phân công bạn cho các xe/tuyến dưới đây, nhưng
              chưa tạo lịch chi tiết. Khi quản trị viên thêm lịch, chúng sẽ xuất
              hiện trên lịch ở trên.
            </p>
            <ul className="space-y-3">
              {assignments.map((a) => {
                const license =
                  a.license_plate ||
                  a.bus_license ||
                  (a.bus && a.bus.license_plate) ||
                  a.bus_id ||
                  "-";
                const route =
                  a.route_name ||
                  (a.route && a.route.route_name) ||
                  a.route_id ||
                  "-";
                const note = a.notes || a.assignment_note || "";
                return (
                  <li
                    key={a.id || a.bus_id || `${license}-${route}`}
                    className="p-3 bg-white rounded shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">{route}</div>
                        <div className="text-sm text-gray-600">
                          Xe: {license}
                        </div>
                        {note && (
                          <div className="text-sm text-gray-500 mt-1">
                            Ghi chú: {note}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {/* If there is a typical time field, show it */}
                        {a.start_time || a.time || a.shift ? (
                          <div>
                            {(a.start_time || a.time || a.shift).toString()}
                          </div>
                        ) : (
                          <div>Thời gian: (chưa có)</div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
