// frontend/src/pages/Students/StudentsPage.jsx
// Trang quản lý danh sách Học sinh

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import AddStudentModal from "../../components/Students/AddStudentModal";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Tìm kiếm học sinh
    const filtered = students.filter(
      (student) =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/v1/students");
      if (response.data.success) {
        setStudents(response.data.data);
        setFilteredStudents(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách học sinh:", error);
      toast.error("Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa học sinh này?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/v1/students/${id}`);
      toast.success("Xóa học sinh thành công");
      fetchStudents();
    } catch (error) {
      console.error("Lỗi khi xóa học sinh:", error);
      toast.error("Không thể xóa học sinh");
    }
  };

  const handleAddStudent = async (studentData) => {
    try {
      console.log("Sending student data:", studentData); // Debug log
      const response = await axios.post(
        "http://localhost:3000/api/v1/students",
        studentData
      );
      console.log("Response:", response.data); // Debug log
      toast.success("Thêm học sinh thành công!");
      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error("Lỗi khi thêm học sinh:", error);
      console.error("Error response:", error.response?.data); // Debug log
      // If backend returned validation errors array, show them
      const validationErrors = error.response?.data?.errors;
      const errorMsg =
        (validationErrors && validationErrors.join("; ")) ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể thêm học sinh";
      toast.error(errorMsg);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEditStudent = (student) => {
    console.log("[StudentsPage] Edit student clicked:", student);
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (studentData) => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/students/${selectedStudent.id}`,
        studentData
      );
      toast.success("Cập nhật học sinh thành công!");
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Lỗi khi cập nhật học sinh:", error);
      console.error("Error response:", error.response?.data);
      const validationErrors = error.response?.data?.errors;
      const errorMsg =
        (validationErrors && validationErrors.join("; ")) ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể cập nhật học sinh";
      toast.error(errorMsg);
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
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Học sinh</h2>
          <p className="text-gray-600 mt-1">
            Danh sách tất cả học sinh trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Thêm Học sinh</span>
        </button>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStudent}
      />

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã hoặc lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tổng số học sinh</p>
          <p className="text-2xl font-bold text-blue-600">{students.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Đang trên xe</p>
          <p className="text-2xl font-bold text-green-600">
            {students.filter((s) => s.status === "IN_BUS").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Đang chờ</p>
          <p className="text-2xl font-bold text-yellow-600">
            {students.filter((s) => s.status === "WAITING").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Vắng mặt</p>
          <p className="text-2xl font-bold text-red-600">
            {students.filter((s) => s.status === "ABSENT").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã HS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ và tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp
                </th>
                {/* Đã xóa cột Địa chỉ */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xe buýt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.parent_contact}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {student.class} - {student.grade}
                  </td>
                  {/* Đã xóa cột địa chỉ */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {student.assigned_bus_id || (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        student.status === "IN_BUS"
                          ? "bg-green-100 text-green-800"
                          : student.status === "WAITING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.status === "IN_BUS"
                        ? "Trên xe"
                        : student.status === "WAITING"
                        ? "Đang chờ"
                        : "Vắng mặt"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* Hiển thị nhanh điểm đón / điểm trả bên trong nút Xem (icon con mắt) */}
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
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
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-500">Không tìm thấy học sinh nào</p>
        </div>
      )}

      {/* Modal Xem Chi Tiết */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-bold mb-4">Chi tiết Học sinh</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Mã HS:
                </label>
                <p className="text-gray-900">{selectedStudent.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Họ và tên:
                </label>
                <p className="text-gray-900">{selectedStudent.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Lớp:
                </label>
                <p className="text-gray-900">
                  {selectedStudent.class} - {selectedStudent.grade}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Liên hệ phụ huynh:
                </label>
                <p className="text-gray-900">
                  {selectedStudent.parent_contact}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Xe buýt:
                </label>
                <p className="text-gray-900">
                  {selectedStudent.assigned_bus_id || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Điểm đón:
                </label>
                <p className="text-gray-900">
                  {selectedStudent.pickup_location_name || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Điểm trả:
                </label>
                <p className="text-gray-900">
                  {selectedStudent.dropoff_location_name || "Chưa có"}
                </p>
              </div>
              {/* Đã xóa thông tin địa chỉ */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Trạng thái:
                </label>
                <p className="text-gray-900">
                  {selectedStudent.status === "IN_BUS"
                    ? "Trên xe"
                    : selectedStudent.status === "WAITING"
                    ? "Đang chờ"
                    : "Vắng mặt"}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa Học sinh */}
      {isEditModalOpen && selectedStudent && (
        <AddStudentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleUpdateStudent}
          initialData={selectedStudent}
        />
      )}
    </div>
  );
};

export default StudentsPage;
