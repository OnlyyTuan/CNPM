// Modal xem mới hoàn toàn, chỉ hiển thị thông tin dạng text
const NewViewScheduleModal = ({ isOpen, onClose, schedule, buses, routes, assignments = [] }) => {
    const [studentModalOpen, setStudentModalOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const handleViewStudents = async () => {
  setStudentModalOpen(true);
  setLoadingStudents(true);
  try {
    // Dùng API mới, chính xác 100% theo câu SQL bạn thích
    const { getStudentsByBusId } = await import('../../api/studentApi');
    const res = await getStudentsByBusId(schedule.bus_id);
    
    setStudents(res.data || []);
  } catch (err) {
    console.error(err);
    toast.error("Không tải được danh sách học sinh");
    setStudents([]);
  } finally {
    setLoadingStudents(false);
  }
};
  if (!isOpen || !schedule) return null;
  const bus = buses.find(b => String(b.id) === String(schedule.bus_id));
  const route = routes.find(r => String(r.id) === String(schedule.route_id));
  // Tìm assignment để lấy tên tài xế
  let driverName = '';
  if (Array.isArray(assignments)) {
    const assignment = assignments.find(a => String(a.bus_id) === String(schedule.bus_id));
    driverName = assignment?.driver_name || '';
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-2 border-blue-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-blue-700">Chi tiết lịch trình</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={28} /></button>
        </div>
        <div className="space-y-5">
          <div>
            <span className="block text-xs text-gray-500 mb-1">Xe buýt</span>
            <div className="font-bold text-lg text-blue-800">{bus ? `${bus.license_plate} - ${bus.capacity} chỗ` : schedule.bus_id}</div>
          </div>
          <div>
            <span className="block text-xs text-gray-500 mb-1">Tuyến đường</span>
            <div className="font-bold text-lg text-blue-800">{route ? route.route_name : schedule.route_id}</div>
          </div>
          <div>
            <span className="block text-xs text-gray-500 mb-1">Tài xế</span>
            <div className="font-bold text-lg text-blue-800">{driverName || 'Chưa có tài xế'}</div>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="block text-xs text-gray-500 mb-1">Bắt đầu</span>
              <div className="font-semibold text-gray-700">{format(new Date(schedule.start_time), 'dd/MM/yyyy HH:mm')}</div>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Kết thúc</span>
              <div className="font-semibold text-gray-700">{format(new Date(schedule.end_time), 'dd/MM/yyyy HH:mm')}</div>
            </div>
          </div>
          <div>
            <span className="block text-xs text-gray-500 mb-1">Trạng thái</span>
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
              {
                schedule.status === 'PLANNED' ? 'Đã lên kế hoạch' :
                schedule.status === 'ONGOING' ? 'Đang diễn ra' :
                schedule.status === 'COMPLETED' ? 'Hoàn thành' :
                schedule.status === 'CANCELED' ? 'Đã hủy' : schedule.status
              }
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-8">
          <button onClick={handleViewStudents} className="px-5 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">Xem danh sách học sinh</button>
          <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Đóng</button>
        </div>
        {studentModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border-2 border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-700">Danh sách học sinh trên xe buýt</h3>
                <button onClick={() => setStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              {loadingStudents ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
  {students.length === 0 ? (
    <div className="text-center text-gray-500 py-8">
      Không có học sinh nào đăng ký trên xe này.
    </div>
  ) : (
    students.map((student) => (
      <div
        key={student.id}
        className="p-4 border border-gray-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
      >
        {/* Tên học sinh */}
        <div className="font-bold text-lg text-blue-800">
          {student.ho_ten_hs}
        </div>

        {/* Lớp */}
        <div className="text-sm text-gray-700 mt-1">
          Lớp: <span className="font-medium">{student.lop || 'Chưa có lớp'}</span>
        </div>

        {/* Điểm đón - trả */}
        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
          <div>
            <span className="text-gray-600">Đón:</span>{' '}
            <span className="font-medium text-green-700">
              {student.diem_don || 'Chưa chọn'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Trả:</span>{' '}
            <span className="font-medium text-red-700">
              {student.diem_tra || 'Chưa chọn'}
            </span>
          </div>
        </div>

        {/* Phụ huynh */}
        <div className="mt-3 pt-2 border-t border-gray-300 text-sm">
          <span className="font-medium text-gray-700">
            Phụ huynh: {student.ho_ten_phu_huynh || 'Chưa có'}
          </span>
          {student.sdt_phu_huynh && (
            <span className="ml-2 text-blue-600 font-medium">
              {student.sdt_phu_huynh}
            </span>
          )}
        </div>
      </div>
    ))
  )}
</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useEffect, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import toast from "react-hot-toast";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../../api/scheduleApi";
import { getAllAssignments } from "../../api/assignmentApi";

// Cấu hình localizer cho calendar (tiếng Việt)
const locales = { vi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// ==================== Modal Thêm/Sửa/Xem Lịch trình ====================
const ScheduleModal = ({
  isOpen,
  onClose,
  schedule,
  onSave,
  buses,
  routes,
  assignments = [],
  readOnly = false,
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
          ? new Date(new Date(schedule.start_time).getTime() + 7 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 16)
          : "",
        end_time: schedule.end_time
          ? new Date(new Date(schedule.end_time).getTime() + 7 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 16)
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
  }, [schedule, assignments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!readOnly) onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {readOnly
              ? "Xem Lịch trình"
              : schedule
              ? "Sửa Lịch trình"
              : "Thêm Lịch trình mới"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {assignments && assignments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dùng phân công hiện có
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => {
                    if (readOnly) return;
                    const sel = e.target.value;
                    setSelectedAssignmentId(sel);
                    setUseAssignment(!!sel);
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
                  disabled={readOnly}
                >
                  <option value="">-- Chọn phân công (tùy chọn) --</option>
                  {assignments.map((a) => (
                    <option
                      key={a.bus_id || a.id}
                      value={a.bus_id || a.busId || a.id}
                    >
                      {a.license_plate || a.bus_license || `${a.bus_id || a.id}`} -{" "}
                      {a.route_name || a.route_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (readOnly) return;
                    setSelectedAssignmentId("");
                    setUseAssignment(false);
                    setFormData((s) => ({ ...s, bus_id: "", route_id: "" }));
                  }}
                  className="px-3 py-2 border rounded text-sm whitespace-nowrap"
                  disabled={readOnly}
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

          {!useAssignment && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xe buýt <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.bus_id}
                  onChange={(e) => {
                    if (readOnly) return;
                    setFormData({ ...formData, bus_id: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readOnly}
                >
                  <option value="">Chọn xe buýt</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.license_plate} - {bus.capacity} chỗ
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tuyến đường <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.route_id}
                  onChange={(e) => {
                    if (readOnly) return;
                    setFormData({ ...formData, route_id: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readOnly}
                >
                  <option value="">Chọn tuyến đường</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.route_name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => {
                if (readOnly) return;
                setFormData({ ...formData, start_time: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => {
                if (readOnly) return;
                setFormData({ ...formData, end_time: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                if (readOnly) return;
                setFormData({ ...formData, status: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={readOnly}
            >
              <option value="PLANNED">Đã lên kế hoạch</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELED">Đã hủy</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {readOnly ? "Đóng" : "Hủy"}
            </button>
            {!readOnly && (
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {schedule ? "Cập nhật" : "Thêm mới"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== Modal Xác nhận Xóa ====================
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn xóa lịch trình này không? Hành động này không thể hoàn tác.
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

// ==================== Component Chính ====================
const SchedulePage = () => {
    // Modal xem mới
    const [newViewModalOpen, setNewViewModalOpen] = useState(false);
    const [newViewSchedule, setNewViewSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  // Calendar state for view switching
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');

  // Modal xem lịch trình
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewSchedule, setViewSchedule] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const schedulesRes = await getAllSchedules();
      if (schedulesRes.success) setSchedules(schedulesRes.data);

      try {
        const busesRes = await import("../../api/busApi").then((m) => m.getAllBuses());
        const busesData = Array.isArray(busesRes) ? busesRes : busesRes?.data || [];
        if (Array.isArray(busesData)) setBuses(busesData);
      } catch (err) {
        setBuses([
          { id: "1", license_plate: "29A-12345", capacity: 45 },
          { id: "2", license_plate: "29B-67890", capacity: 40 },
        ]);
      }

      try {
        const routesModule = await import("../../api/routeApi");
        const routesRes = await routesModule.getAllRoutes();
        if (Array.isArray(routesRes)) setRoutes(routesRes);

        const assignRes = await getAllAssignments();
        const assignData = Array.isArray(assignRes) ? assignRes : assignRes?.data || [];
        if (Array.isArray(assignData)) setAssignments(assignData);
      } catch (err) {
        setRoutes([
          { id: "R001", route_name: "Tuyến 1: Trung tâm - Quận 9" },
          { id: "R002", route_name: "Tuyến 2: Bình Thạnh - Thủ Đức" },
        ]);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Lọc events
  const filteredEvents = useMemo(() => {
    let filtered = schedules;
    if (selectedRouteId !== "ALL") {
      filtered = schedules.filter((s) => String(s.route_id) === String(selectedRouteId));
    }
    // Nếu đang ở view 'agenda', chỉ hiện lịch trình của ngày đã chọn
    if (calendarView === "agenda") {
      const selectedDate = format(calendarDate, "yyyy-MM-dd");
      filtered = filtered.filter((s) => {
        const eventDate = format(new Date(s.start_time), "yyyy-MM-dd");
        return eventDate === selectedDate;
      });
    }
    return filtered.map((schedule) => ({
      id: schedule.id,
      title: `${schedule.license_plate || schedule.bus_license_plate || "Xe"} - ${schedule.route_name || "Tuyến"}`,
      start: new Date(schedule.start_time),
      end: new Date(schedule.end_time),
      resource: schedule,
    }));
  }, [schedules, selectedRouteId, calendarView, calendarDate]);

  const handleAddSchedule = () => {
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setViewModalOpen(false); // Đảm bảo modal xem không bị mở cùng lúc
    setSelectedSchedule(schedule);
    setModalOpen(true);
  };

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
      toast.error(error.response?.data?.message || "Không thể xóa lịch trình");
    } finally {
      setDeleteModalOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleSaveSchedule = async (formData) => {
    try {
      if (selectedSchedule) {
        const response = await updateSchedule(selectedSchedule.id, formData);
        if (response.success) toast.success("Cập nhật thành công");
      } else {
        const response = await createSchedule(formData);
        if (response.success) toast.success("Thêm lịch trình thành công");
      }
      fetchData();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lưu lịch trình thất bại");
    }
  };

  // Custom Components
  // Month: chỉ hiện nút xem chi tiết, không hiện event
  const CustomMonthDateHeader = ({ label, date }) => {
    const handleViewDay = (e) => {
      e.stopPropagation();
      setCalendarDate(date);
      setCalendarView('agenda');
    };
    return (
      <div className="rbc-date-cell flex flex-col items-end pr-2 h-full">
        <span className="text-sm font-medium">{label}</span>
        <button
          className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition shadow"
          onClick={handleViewDay}
        >Xem chi tiết</button>
      </div>
    );
  };

  // Không hiện event trong ô ngày tháng
  const CustomMonthEvent = () => null;

  // Agenda: hiển thị danh sách lịch trình trong ngày, đầy đủ chức năng
  const CustomAgendaEvent = ({ event }) => {
    const schedule = event.resource;
    const duration = Math.round((event.end - event.start) / (1000 * 60));
    return (
      <div className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-600 rounded-lg shadow p-3 mb-2">
        <div className="flex flex-col gap-1">
          <div className="font-bold text-blue-700 text-base">{event.title}</div>
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <Clock size={12} />
            {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")} ({duration}p)
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button onClick={() => {
            setModalOpen(false);
            setSelectedSchedule(null);
            setNewViewModalOpen(true);
            setNewViewSchedule(schedule);
          }} className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-xs font-bold">Xem</button>
          <button onClick={() => {
            setNewViewModalOpen(false);
            setNewViewSchedule(null);
            setSelectedSchedule(schedule);
            setModalOpen(true);
          }} className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs">Sửa</button>
          <button onClick={() => handleDeleteClick(schedule)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs">Xóa</button>
        </div>
      </div>
    );
        {/* Modal xem mới hoàn toàn - render ngoài cùng, không nằm trong event */}
        {newViewModalOpen && newViewSchedule && (
          <NewViewScheduleModal
            isOpen={true}
            onClose={() => {
              setNewViewModalOpen(false);
              setNewViewSchedule(null);
            }}
            schedule={newViewSchedule}
            buses={buses}
            routes={routes}
          />
        )}
  };

  // Toolbar: chỉ còn Tháng, Ngày, Danh sách
  const CustomToolbar = (toolbar) => {
    const goToBack = () => toolbar.onNavigate("PREV");
    const goToNext = () => toolbar.onNavigate("NEXT");
    const goToCurrent = () => toolbar.onNavigate("TODAY");
    return (
      <div className="rbc-toolbar mb-5 bg-white px-4 py-4 rounded-t-xl border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={goToBack} className="p-2 hover:bg-gray-100 rounded-lg transition"><ChevronLeft size={20} /></button>
            <button onClick={goToCurrent} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Hôm nay</button>
            <button onClick={goToNext} className="p-2 hover:bg-gray-100 rounded-lg transition"><ChevronRight size={20} /></button>
          </div>
          <span className="text-xl font-bold text-gray-800">{toolbar.label}</span>
          <div className="flex bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            {["month", "day"].map((view) => (
              <button
                key={view}
                onClick={() => toolbar.onView(view)}
                className={`px-4 py-2 text-sm font-medium transition ${toolbar.view === view ? "bg-blue-600 text-white" : "hover:bg-gray-200 text-gray-700"}`}
              >
                {view === "month" && "Tháng"}
                {view === "day" && "Ngày"}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Lịch trình</h2>
          <p className="text-gray-600 mt-1">Tạo và quản lý lịch trình xe buýt học sinh</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="min-w-[280px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo tuyến đường</label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả tuyến đường</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>{route.route_name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddSchedule}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <Plus size={20} />
            <span>Thêm Lịch trình</span>
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Đang hiển thị: <span className="font-bold text-blue-600">{filteredEvents.length}</span> lịch trình
      </div>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        <BigCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          culture="vi"
          date={calendarDate}
          view={calendarView}
          onNavigate={date => setCalendarDate(date)}
          onView={view => setCalendarView(view)}
          defaultView="month"
          views={["month", "agenda"]}
          messages={{
            next: "Sau", previous: "Trước", today: "Hôm nay",
            month: "Tháng", agenda: "Danh sách",
            noEventsInRange: "Không có lịch trình nào trong khoảng này.",
            showMore: (count) => `+${count} nữa`,
          }}
          components={{
            toolbar: CustomToolbar,
            month: { dateHeader: CustomMonthDateHeader, event: CustomMonthEvent },
            agenda: { event: CustomAgendaEvent },
          }}
          popup={false}
          style={{ height: 800 }}
        />
      </div>

      {/* Modal xem mới hoàn toàn - render ngoài cùng, không nằm trong event */}
      {newViewModalOpen && newViewSchedule && (
        <NewViewScheduleModal
          isOpen={true}
          onClose={() => {
            setNewViewModalOpen(false);
            setNewViewSchedule(null);
          }}
          schedule={newViewSchedule}
          buses={buses}
          routes={routes}
          assignments={assignments}
        />
      )}

      <ScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        schedule={selectedSchedule}
        onSave={handleSaveSchedule}
        buses={buses}
        routes={routes}
        assignments={assignments}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default SchedulePage;