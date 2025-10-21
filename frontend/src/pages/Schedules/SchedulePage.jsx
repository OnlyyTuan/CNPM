// frontend/src/pages/Schedules/SchedulePage.jsx
// Trang quản lý Lịch trình xe buýt với Calendar

import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../../api/scheduleApi';

// Cấu hình localizer cho calendar
const locales = {
  'vi': vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Component Modal cho thêm/sửa lịch trình
const ScheduleModal = ({ isOpen, onClose, schedule, onSave, buses, routes }) => {
  const [formData, setFormData] = useState({
    bus_id: '',
    route_id: '',
    start_time: '',
    end_time: '',
    status: 'PLANNED',
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        bus_id: schedule.bus_id || '',
        route_id: schedule.route_id || '',
        start_time: schedule.start_time ? new Date(schedule.start_time).toISOString().slice(0, 16) : '',
        end_time: schedule.end_time ? new Date(schedule.end_time).toISOString().slice(0, 16) : '',
        status: schedule.status || 'PLANNED',
      });
    } else {
      setFormData({
        bus_id: '',
        route_id: '',
        start_time: '',
        end_time: '',
        status: 'PLANNED',
      });
    }
  }, [schedule]);

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
            {schedule ? 'Sửa Lịch trình' : 'Thêm Lịch trình mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chọn xe buýt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xe buýt <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bus_id}
              onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
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

          {/* Chọn tuyến đường */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tuyến đường <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.route_id}
              onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
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

          {/* Thời gian bắt đầu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
              {schedule ? 'Cập nhật' : 'Thêm mới'}
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

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
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
      // Lấy schedules
      const schedulesRes = await getAllSchedules();
      if (schedulesRes.success) {
        setSchedules(schedulesRes.data);
      }

      // Lấy buses (giả sử có API)
      // const busesRes = await getAllBuses();
      // setBuses(busesRes.data);

      // Lấy routes (giả sử có API)
      // const routesRes = await getAllRoutes();
      // setRoutes(routesRes.data);

      // Mock data cho demo
      setBuses([
        { id: '1', license_plate: '29A-12345', capacity: 45 },
        { id: '2', license_plate: '29B-67890', capacity: 40 },
      ]);
      setRoutes([
        { id: '1', route_name: 'Tuyến 1: Trung tâm - Quận 9' },
        { id: '2', route_name: 'Tuyến 2: Bình Thạnh - Thủ Đức' },
      ]);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
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
        toast.success('Xóa lịch trình thành công');
        fetchData();
      }
    } catch (error) {
      console.error('Lỗi khi xóa lịch trình:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa lịch trình');
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
          toast.success('Cập nhật lịch trình thành công');
          fetchData();
        }
      } else {
        // Thêm mới
        const response = await createSchedule(formData);
        if (response.success) {
          toast.success('Thêm lịch trình thành công');
          fetchData();
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi lưu lịch trình:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu lịch trình');
    }
  };

  // Custom Event Component
  const EventComponent = ({ event }) => {
    const schedule = event.resource;
    return (
      <div className="text-xs">
        <div className="font-semibold">{event.title}</div>
        <div className="flex space-x-1 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditSchedule(schedule);
            }}
            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(schedule);
            }}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <Trash2 size={12} />
          </button>
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
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Lịch trình</h2>
          <p className="text-gray-600 mt-1">Tạo và quản lý lịch trình xe buýt</p>
        </div>
        <button
          onClick={handleAddSchedule}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Thêm Lịch trình</span>
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-md p-6" style={{ height: '700px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
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
          onSelectEvent={(event) => handleEditSchedule(event.resource)}
        />
      </div>

      {/* Modals */}
      <ScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        schedule={selectedSchedule}
        onSave={handleSaveSchedule}
        buses={buses}
        routes={routes}
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
