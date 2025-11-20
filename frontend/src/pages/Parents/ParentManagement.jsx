import React, { useEffect, useState } from "react";
import parentApi from "../../api/parentApi";
import {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../../api/studentApi";
import { getAllBuses } from "../../api/busApi";
import { getAllDrivers } from "../../api/driverApi";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";

const ParentManagement = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewParent, setViewParent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  // inline add/edit child removed; use Students management or selector
  const [isEditParentOpen, setIsEditParentOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [parentFullName, setParentFullName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentAddress, setParentAddress] = useState("");
  const [isSelectStudentOpen, setIsSelectStudentOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [parentMap, setParentMap] = useState({});
  const [driversMap, setDriversMap] = useState({});
  const [busesMap, setBusesMap] = useState({});
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [pendingStudent, setPendingStudent] = useState(null);
  const [pendingStudentParentName, setPendingStudentParentName] =
    useState(null);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await parentApi.getAllParents();
      const data = res?.data ?? res ?? [];
      setParents(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      console.error("Failed to load parents", err);
      toast.error("Không thể tải danh sách phụ huynh");
    } finally {
      setLoading(false);
    }
  };

  const confirmAssignProceed = async () => {
    if (!pendingStudent || !editingParent) return;
    try {
      await updateStudent(pendingStudent.id, { parent_id: editingParent.id });
      toast.success(
        `Gán ${
          pendingStudent.full_name || pendingStudent.name || pendingStudent.id
        } cho phụ huynh thành công`
      );
    } catch (err) {
      console.error("Assign (confirm) failed", err);
      toast.error("Không thể gán học sinh");
      setConfirmAssignOpen(false);
      setPendingStudent(null);
      setPendingStudentParentName(null);
      return;
    }

    // refresh silently
    try {
      await fetchParents();
    } catch (e) {
      console.error(e);
    }
    try {
      const p = (await parentApi.getParentById?.(editingParent.id)) ?? null;
      if (p) {
        const students =
          p?.data?.Students ?? p?.Students ?? (p.data ?? p).Students ?? [];
        setEditingParent({ ...(p.data ?? p), Students: students });
      }
    } catch (e) {
      console.error(e);
    }
    try {
      await fetchStudents();
    } catch (e) {
      console.error(e);
    }

    setConfirmAssignOpen(false);
    setPendingStudent(null);
    setPendingStudentParentName(null);
  };

  const cancelConfirmAssign = () => {
    setConfirmAssignOpen(false);
    setPendingStudent(null);
    setPendingStudentParentName(null);
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // sync local edit form when editingParent changes
  useEffect(() => {
    if (editingParent) {
      setParentFullName(
        editingParent.fullName || editingParent.full_name || ""
      );
      setParentPhone(editingParent.phone || editingParent.parent_contact || "");
      setParentAddress(editingParent.address || "");
    } else {
      setParentFullName("");
      setParentPhone("");
      setParentAddress("");
    }
  }, [editingParent]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await getAllStudents();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : data.data ?? [];
      setStudentsList(list || []);
      // also fetch parents to map parent_id -> name for display
      try {
        const pr = await parentApi.getAllParents();
        const parentsData = pr?.data ?? pr ?? [];
        const parentsList = Array.isArray(parentsData)
          ? parentsData
          : parentsData.data ?? [];
        const map = {};
        parentsList.forEach((p) => {
          const id = p.id ?? p.ID ?? p.id;
          const name =
            p.full_name ||
            p.fullName ||
            p.fullname ||
            p.fullName ||
            p.name ||
            "";
          if (id) map[id] = name;
        });
        setParentMap(map);
        // also fetch buses and drivers to show assigned driver for each student
        try {
          const [busesRes, driversRes] = await Promise.all([
            getAllBuses(),
            getAllDrivers(),
          ]);
          const buses = busesRes || [];
          const drivers = driversRes || [];
          const bmap = {};
          (buses || []).forEach((b) => {
            if (!b) return;
            const id = b.id ?? b.ID ?? b.id;
            if (id) bmap[id] = b;
          });
          setBusesMap(bmap);

          const dmap = {};
          (drivers || []).forEach((d) => {
            if (!d) return;
            const id = d.id ?? d.ID ?? d.id;
            const uid = d.user_id ?? d.userId ?? (d.User && d.User.id) ?? null;
            if (id) dmap[id] = d;
            if (uid) dmap[uid] = d;
          });
          setDriversMap(dmap);
        } catch (e) {
          console.error("Load buses/drivers for map failed", e);
        }
      } catch (e) {
        console.error("Load parents for map failed", e);
      }
    } catch (err) {
      console.error("Load students failed", err);
      toast.error("Không thể tải danh sách học sinh");
    } finally {
      setLoadingStudents(false);
    }
  };

  const navigate = useNavigate();

  const handleOpenSelectStudent = async () => {
    setIsSelectStudentOpen(true);
    await fetchStudents();
  };

  const handleAssignStudent = async (student) => {
    // If the student already has a different parent, ask for confirmation first.
    if (
      student.parent_id &&
      editingParent &&
      String(student.parent_id) !== String(editingParent.id)
    ) {
      setPendingStudent(student);
      setConfirmAssignOpen(true);
      // try to fetch current parent name for context (best-effort)
      try {
        const pr = (await parentApi.getParentById?.(student.parent_id)) ?? null;
        const name =
          pr?.data?.full_name ??
          pr?.fullName ??
          pr?.data?.fullName ??
          String(student.parent_id);
        setPendingStudentParentName(name);
      } catch (e) {
        setPendingStudentParentName(String(student.parent_id));
      }
      return;
    }

    // perform assignment
    try {
      await updateStudent(student.id, { parent_id: editingParent.id });
      toast.success(
        `Gán ${
          student.full_name || student.name || student.id
        } cho phụ huynh thành công`
      );
    } catch (err) {
      console.error("Assign student failed", err);
      toast.error("Không thể gán học sinh");
      return;
    }

    // non-critical follow-up: refresh lists, but swallow errors so user does not see duplicate error toasts
    try {
      await fetchParents();
    } catch (err) {
      console.error("Refresh parents failed after assign", err);
    }

    try {
      const p = (await parentApi.getParentById?.(editingParent.id)) ?? null;
      if (p) {
        const students =
          p?.data?.Students ?? p?.Students ?? (p.data ?? p).Students ?? [];
        setEditingParent({ ...(p.data ?? p), Students: students });
      }
    } catch (err) {
      console.error("Fetch parent details failed after assign", err);
    }

    try {
      await fetchStudents();
    } catch (err) {
      console.error("Refresh students failed after assign", err);
    }
  };

  const handleDelete = async (parent) => {
    if (
      !confirm(`Xác nhận xóa phụ huynh ${parent.fullName || parent.full_name}?`)
    )
      return;
    try {
      // Try to delete by user account if available
      const userId = parent.userId ?? parent.user_id ?? null;
      if (userId) {
        // import userApi lazily to avoid circular imports
        const userApi = (await import("../../api/userApi")).default;
        await userApi.deleteUser(userId);
        toast.success("Xóa phụ huynh thành công");
        fetchParents();
        return;
      }
      // Fallback: try parentApi.deleteParent (may not exist on backend)
      if (parentApi.deleteParent) {
        await parentApi.deleteParent(parent.id);
        toast.success("Xóa phụ huynh thành công");
        fetchParents();
        return;
      }
      toast.error("Không thể xóa: không tìm thấy userId hoặc endpoint xóa");
    } catch (err) {
      console.error("Delete parent failed", err);
      toast.error("Xóa thất bại");
    }
  };

  const handleView = async (p) => {
    try {
      setLoadingStudent(true);
      // Ensure we have up-to-date student details (if any)
      const students = Array.isArray(p.Students)
        ? p.Students
        : p.students ?? [];
      const detailed = await Promise.all(
        students.map(async (s) => {
          try {
            const r = await getStudentById(s.id);
            return r?.data ?? r ?? s;
          } catch (e) {
            return s;
          }
        })
      );
      setViewParent({ ...p, Students: detailed });
    } catch (err) {
      console.error("Load student details failed", err);
      toast.error("Không thể tải thông tin con");
    } finally {
      setLoadingStudent(false);
    }
  };

  // Child (Student) management is handled via the Students page or selector

  const handleDeleteChild = async (student) => {
    if (
      !confirm(
        `Xác nhận xóa học sinh ${
          student.name || student.full_name || student.id
        }?`
      )
    )
      return;
    try {
      await deleteStudent(student.id);
      toast.success("Xóa con thành công");
      // refresh
      await fetchParents();
      // update viewParent state
      setViewParent((v) => ({
        ...(v || {}),
        Students: (v?.Students || []).filter((s) => s.id !== student.id),
      }));
    } catch (err) {
      console.error("Delete child failed", err);
      toast.error("Xóa con thất bại");
    }
  };

  // editing child from parent modal removed; use Students admin page instead

  const handleOpenEditParent = (parent) => {
    // open edit modal showing basic parent info + children
    setEditingParent(parent);
    setIsEditParentOpen(true);
  };

  const handleSaveParent = async (parentId, formData) => {
    try {
      // backend expects { parentData: { ... } } in some places — use that shape
      await parentApi.updateParent(parentId, {
        parentData: {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        },
      });
      toast.success("Cập nhật phụ huynh thành công");
      await fetchParents();
      setIsEditParentOpen(false);
      setEditingParent(null);
    } catch (err) {
      console.error("Save parent failed", err);
      toast.error("Không thể cập nhật phụ huynh");
    }
  };

  // Editing individual child removed from this modal; use Students management page

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Quản lý Phụ huynh
          </h2>
          <p className="text-gray-600 mt-1">
            Danh sách phụ huynh và con của họ
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Quay lại
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SĐT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số con
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parents.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {p.fullName || p.full_name || p.fullName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.phone || p.parent_contact || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.address || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Array.isArray(p.Students)
                        ? p.Students.length
                        : p.students
                        ? p.students.length
                        : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(p)}
                          title="Xem"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditParent(p)}
                          title="Sửa"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          title="Xóa"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewParent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-bold mb-4">Chi tiết Phụ huynh</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Tên</div>
                <div className="text-gray-900">
                  {viewParent.fullName || viewParent.full_name}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">SĐT</div>
                <div className="text-gray-900">{viewParent.phone}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Địa chỉ</div>
                <div className="text-gray-900">{viewParent.address || "-"}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Danh sách con</div>
                <div className="mt-2 space-y-2">
                  {/* Add child moved into Edit Parent modal */}
                  {loadingStudent ? (
                    <div>Đang tải...</div>
                  ) : (
                    (Array.isArray(viewParent.Students)
                      ? viewParent.Students
                      : []
                    ).map((s) => (
                      <div key={s.id} className="p-2 border rounded">
                        <div className="text-sm font-medium">
                          {s.name || s.full_name || s.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mã: {s.id} • Lớp: {s.className || s.class || "-"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Phụ huynh:{" "}
                          {parentMap[s.parent_id]
                            ? parentMap[s.parent_id]
                            : "Chưa có"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Tài xế:{" "}
                          {(() => {
                            const busId =
                              s.assignedBusId ||
                              s.assigned_bus_id ||
                              s.assigned_bus ||
                              s.assignedBus ||
                              null;
                            const bus = busId ? busesMap[busId] : null;
                            const driverId =
                              bus?.driver_id ||
                              bus?.driverId ||
                              bus?.driver ||
                              null;
                            const driver = driverId
                              ? driversMap[driverId]
                              : null;
                            return driver
                              ? driver.fullName ||
                                  driver.full_name ||
                                  driver.name ||
                                  String(driverId)
                              : "Chưa gán";
                          })()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewParent(null)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Parent Modal */}
      {isEditParentOpen && editingParent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-bold mb-4">Chỉnh sửa Phụ huynh</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm">Họ và tên</label>
                <input
                  className="border px-2 py-1 w-full"
                  value={parentFullName}
                  onChange={(e) => setParentFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm">SĐT</label>
                <input
                  className="border px-2 py-1 w-full"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm">Địa chỉ</label>
                <input
                  className="border px-2 py-1 w-full"
                  value={parentAddress}
                  onChange={(e) => setParentAddress(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">Danh sách con</div>
                  <div>
                    <button
                      onClick={() => handleOpenSelectStudent()}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Thêm con
                    </button>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {(Array.isArray(editingParent.Students)
                    ? editingParent.Students
                    : editingParent.students || []
                  ).map((s) => (
                    <div
                      key={s.id}
                      className="p-2 border rounded flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {s.name || s.full_name || s.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mã: {s.id} • Lớp: {s.className || s.class || "-"}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteChild(s)}
                          title="Xóa"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isSelectStudentOpen && editingParent && (
                <div className="pt-3 border-t">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm">Tìm học sinh</label>
                      <input
                        className="border px-2 py-1 w-full"
                        placeholder="Tìm theo mã hoặc tên"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                    <div>
                      {loadingStudents ? (
                        <div>Đang tải danh sách học sinh...</div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-auto">
                          {(studentsList || [])
                            .filter(
                              (s) =>
                                String(s.id)
                                  .toLowerCase()
                                  .includes(studentSearch.toLowerCase()) ||
                                (s.full_name || s.name || "")
                                  .toLowerCase()
                                  .includes(studentSearch.toLowerCase())
                            )
                            .filter((s) => s.parent_id !== editingParent.id)
                            .map((s) => (
                              <div
                                key={s.id}
                                className="p-2 border rounded flex justify-between items-center"
                              >
                                <div>
                                  <div className="text-sm font-medium">
                                    {s.full_name || s.name || s.id}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Mã: {s.id} • Lớp:{" "}
                                    {s.class || s.className || "-"}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Phụ huynh:{" "}
                                    {parentMap[s.parent_id]
                                      ? parentMap[s.parent_id]
                                      : "Chưa có"}
                                  </div>
                                </div>
                                <div>
                                  <button
                                    onClick={() => handleAssignStudent(s)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                  >
                                    Gán
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setIsSelectStudentOpen(false)}
                        className="px-3 py-1 border rounded"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm reassign modal */}
              {confirmAssignOpen && pendingStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-80 max-w-full">
                    <h4 className="text-lg font-semibold">
                      Xác nhận gán học sinh
                    </h4>
                    <p className="mt-3 text-sm text-gray-700">
                      Học sinh{" "}
                      <strong>
                        {pendingStudent.full_name ||
                          pendingStudent.name ||
                          pendingStudent.id}
                      </strong>
                      {pendingStudentParentName ? (
                        <span>
                          {" "}
                          hiện đang thuộc phụ huynh{" "}
                          <strong>{pendingStudentParentName}</strong>.
                        </span>
                      ) : (
                        <span> hiện đã có phụ huynh.</span>
                      )}
                    </p>
                    <p className="mt-2 text-sm text-gray-700">
                      Bạn có muốn chuyển học sinh này sang phụ huynh hiện tại
                      không?
                    </p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={cancelConfirmAssign}
                        className="px-3 py-1 border rounded"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={confirmAssignProceed}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => {
                  setIsEditParentOpen(false);
                  setEditingParent(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Hủy
              </button>
              <button
                onClick={() =>
                  handleSaveParent(editingParent.id, {
                    full_name: parentFullName,
                    phone: parentPhone,
                    address: parentAddress,
                  })
                }
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentManagement;
