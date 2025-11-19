import React, { useEffect, useMemo, useState } from "react";
import userApi from "../../api/userApi";
import parentApi from "../../api/parentApi";
import { getAllDrivers, updateDriver, createDriver } from "../../api/driverApi";
import { toast } from "react-hot-toast";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import /* Link removed */ "react-router-dom";
import { emitEntityChange, onEntityChange } from "../../utils/eventBus";
import AccountModal from "../../components/Account/AccountModal";
import CreateAccountModal from "../../components/Account/CreateAccountModal";

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [parentsMap, setParentsMap] = useState({});
  const [driversMap, setDriversMap] = useState({});
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'parent' | 'driver'
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createInitialData, setCreateInitialData] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usersRes, parentsRes, driversRes] = await Promise.all([
        userApi.getAllUsers(),
        parentApi.getAllParents(),
        getAllDrivers(),
      ]);

      const usersData = usersRes?.data ?? usersRes ?? [];
      const parentsData = parentsRes?.data ?? parentsRes ?? [];
      const driversData = Array.isArray(driversRes)
        ? driversRes
        : driversRes?.data ?? [];

      setUsers(Array.isArray(usersData) ? usersData : usersData.data ?? []);

      const pMap = {};
      (Array.isArray(parentsData)
        ? parentsData
        : parentsData.data ?? []
      ).forEach((p) => {
        if (!p) return;
        const uid =
          p.user_id ?? p.userId ?? (p.UserAccount && p.UserAccount.id) ?? null;
        if (uid != null) pMap[uid] = p;
      });
      setParentsMap(pMap);

      const dMap = {};
      (Array.isArray(driversData)
        ? driversData
        : driversData.data ?? []
      ).forEach((d) => {
        if (!d) return;
        const uid =
          d.user_id ?? d.userId ?? (d.UserAccount && d.UserAccount.id) ?? null;
        if (uid != null) dMap[uid] = d;
      });
      setDriversMap(dMap);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      toast.error("Không thể tải dữ liệu tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Refresh when other pages emit entity changes (driver/parent/bus/user)
  useEffect(() => {
    const unsubscribe = onEntityChange((detail) => {
      try {
        const entity = detail && detail.entity ? detail.entity : detail;
        if (
          entity === "driver" ||
          entity === "parent" ||
          entity === "bus" ||
          entity === "user"
        ) {
          fetchAll();
        }
      } catch (e) {}
    });
    return unsubscribe;
  }, []);

  const handleView = async (user) => {
    try {
      // fetch latest user data to avoid stale placeholder IDs
      const res = await userApi.getUserById(user.id);
      const latestUser = res?.data || res || null;
      if (!latestUser) {
        toast.error("Người dùng không tồn tại. Đang làm mới danh sách...");
        fetchAll();
        return;
      }
      setModalData({ mode: "view", user: latestUser });
      setModalOpen(true);
    } catch (err) {
      console.error("View profile failed", err);
      toast.error("Không thể lấy thông tin chi tiết");
      // refresh list on not found
      if (err?.response?.status === 404) fetchAll();
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Xác nhận xóa tài khoản ${user.username}?`)) return;
    try {
      await userApi.deleteUser(user.id);
      toast.success("Xóa thành công");
      fetchAll();
      // Emit change so other pages can react
      const entity =
        user.role === "driver"
          ? "driver"
          : user.role === "parent"
          ? "parent"
          : "user";
      emitEntityChange(entity);
    } catch (err) {
      console.error("Delete user failed", err);
      toast.error("Xóa thất bại");
    }
  };

  const handleEdit = async (user) => {
    try {
      // ensure user exists and get latest data
      const res = await userApi.getUserById(user.id);
      const latestUser = res?.data || res || null;
      if (!latestUser) {
        toast.error("Người dùng không tồn tại. Đang làm mới danh sách...");
        fetchAll();
        return;
      }
      // open modal in edit mode with freshest data
      setModalData({ mode: "edit", user: latestUser });
      setModalOpen(true);
    } catch (err) {
      console.error("Prepare edit failed", err);
      toast.error("Không thể mở form chỉnh sửa");
      if (err?.response?.status === 404) fetchAll();
    }
  };

  const mergedList = useMemo(() => {
    // Filter users to parent/driver only
    const candidates = (users || []).filter(
      (u) => u && (u.role === "parent" || u.role === "driver")
    );

    const q = search.trim().toLowerCase();

    return candidates.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      const profile = u.role === "parent" ? parentsMap[u.id] : driversMap[u.id];
      const name =
        profile?.fullName ||
        profile?.name ||
        profile?.full_name ||
        profile?.displayName ||
        "";
      return (
        String(u.username || "")
          .toLowerCase()
          .includes(q) ||
        String(u.email || "")
          .toLowerCase()
          .includes(q) ||
        String(u.id || "")
          .toLowerCase()
          .includes(q) ||
        String(name || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [users, parentsMap, driversMap, search, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Quản lý Tài khoản
          </h2>
          <p className="text-gray-600 mt-1">
            Danh sách tài khoản (Phụ huynh & Tài xế)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={18} />
            <span>Tạo tài khoản mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="mb-4">
          <div className="relative max-w-xl">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo username, email, tên hoặc ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role filter: All / Parent / Driver */}
          <div className="mt-3 flex items-center space-x-2">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1 rounded ${
                roleFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setRoleFilter("parent")}
              className={`px-3 py-1 rounded ${
                roleFilter === "parent"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Phụ huynh
            </button>
            <button
              onClick={() => setRoleFilter("driver")}
              className={`px-3 py-1 rounded ${
                roleFilter === "driver"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Tài xế
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Tổng tài khoản</p>
              <p className="text-2xl font-bold text-blue-600">
                {mergedList.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Phụ huynh</p>
              <p className="text-2xl font-bold text-green-600">
                {mergedList.filter((u) => u.role === "parent").length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Tài xế</p>
              <p className="text-2xl font-bold text-yellow-600">
                {mergedList.filter((u) => u.role === "driver").length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Tải lại</p>
              <button
                onClick={fetchAll}
                className="mt-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Làm mới
              </button>
            </div>
          </div>
        </div>

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
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mergedList.map((u) => {
                  const profile =
                    u.role === "parent" ? parentsMap[u.id] : driversMap[u.id];
                  const displayName =
                    profile?.fullName ||
                    profile?.name ||
                    profile?.full_name ||
                    profile?.displayName ||
                    "-";
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {u.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {u.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {displayName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {u.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {u.role}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(u)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-900 transition-shadow shadow-sm"
                            title="Xem chi tiết"
                            aria-label={`Xem chi tiết ${u.username || u.id}`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(u)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* View / Edit modal */}
      <AccountModal
        open={modalOpen && modalData?.mode === "view"}
        onClose={() => setModalOpen(false)}
        title={modalData?.mode === "view" ? "Chi tiết tài khoản" : ""}
      >
        {modalData?.mode === "view" &&
          (() => {
            const u = modalData.user;
            const profile =
              u?.role === "parent" ? parentsMap[u.id] : driversMap[u.id];
            return (
              <div className="max-w-md">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {String(u.username || u.id || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {u.username || "-"}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {u.id}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700">
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="mt-1">{u.email || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Role</div>
                      <div className="mt-1 capitalize">{u.role || "-"}</div>
                    </div>
                    {profile && (
                      <div className="mt-2 p-3 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">
                          Thông tin{" "}
                          {u.role === "parent" ? "Phụ huynh" : "Tài xế"}
                        </div>
                        <div className="mt-1 text-sm text-gray-800">
                          {profile.fullName ||
                            profile.full_name ||
                            profile.name ||
                            "-"}
                        </div>
                        <div className="text-sm text-gray-600">
                          SĐT: {profile.phone || profile.parent_contact || "-"}
                        </div>
                        {profile.license_number && (
                          <div className="text-sm text-gray-600">
                            GPLX: {profile.license_number}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
      </AccountModal>

      {/* Edit modal */}
      <AccountModal
        open={modalOpen && modalData?.mode === "edit"}
        onClose={() => setModalOpen(false)}
        title={"Chỉnh sửa tài khoản"}
      >
        {modalData?.mode === "edit" &&
          (() => {
            const profile =
              modalData.user?.role === "parent"
                ? parentsMap[modalData.user.id]
                : driversMap[modalData.user.id];
            return (
              <EditUserForm
                user={modalData.user}
                profile={profile}
                onSaved={() => {
                  setModalOpen(false);
                  fetchAll();
                }}
                onRequestCreate={(prefill) => {
                  setCreateInitialData(prefill || null);
                  setCreateOpen(true);
                }}
              />
            );
          })()}
      </AccountModal>

      <CreateAccountModal
        open={createOpen}
        initialData={createInitialData}
        onClose={() => {
          setCreateOpen(false);
          setCreateInitialData(null);
        }}
        onCreated={() => fetchAll()}
      />
    </div>
  );
};

// Small inline edit form component
const EditUserForm = ({ user, onSaved, profile }) => {
  const [email, setEmail] = React.useState(user.email || "");
  const [username, setUsername] = React.useState(user.username || "");
  const [name, setName] = React.useState(
    profile?.fullName || profile?.full_name || profile?.name || ""
  );
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!username || !String(username).trim()) {
        toast.error("Username không được để trống");
        setLoading(false);
        return;
      }

      // Defensive check: avoid sending updates for missing or seeded placeholder IDs
      if (!user.id || user.id === "DEFAULT_PARENT_USER") {
        toast.error(
          "ID người dùng không hợp lệ hoặc là user mặc định — không thể cập nhật."
        );
        setLoading(false);
        return;
      }

      // update user basic info; if user row doesn't exist (404) we'll fall back to creating user+profile
      try {
        await userApi.updateUser(user.id, { email, username });
      } catch (updateErr) {
        // If user not found (404), try to update parent profile directly (in case parent exists without user)
        if (updateErr?.response?.status === 404) {
          try {
            // Try to find a parent linked to this user id
            const parentsRes = await parentApi.getAllParents();
            const parentsList = parentsRes?.data ?? parentsRes ?? [];
            const existing = (parentsList || []).find((p) => {
              const uid =
                p.user_id ??
                p.userId ??
                (p.UserAccount && p.UserAccount.id) ??
                null;
              return String(uid) === String(user.id);
            });

            if (existing) {
              // Update parent name directly
              await parentApi.updateParent(existing.id, {
                parentData: { fullName: name },
              });
              toast.success(
                "Cập nhật tên phụ huynh thành công (không cần user row)"
              );
              emitEntityChange("parent");
              onSaved && onSaved();
              setLoading(false);
              return;
            }

            // If not a parent, or no parent row found, try driver profile fallback
            try {
              const driversRes = await getAllDrivers();
              const driversList = driversRes?.data ?? driversRes ?? [];
              const existingDriver = (driversList || []).find((d) => {
                const uid =
                  d.user_id ?? d.userId ?? (d.User && d.User.id) ?? null;
                return String(uid) === String(user.id);
              });
              if (existingDriver) {
                // Update driver name directly
                await updateDriver(existingDriver.id, {
                  driverData: { fullName: name },
                });
                toast.success(
                  "Cập nhật tên tài xế thành công (không cần user row)"
                );
                emitEntityChange("driver");
                onSaved && onSaved();
                setLoading(false);
                return;
              }
            } catch (drvErr) {
              console.warn("Driver fallback failed", drvErr);
            }

            // If no parent exists, fall back to opening create modal so admin can create the missing user/profile
            const prefill = {
              role: user.role,
              username,
              email,
              fullName: name,
              id: user.id,
            };
            toast(
              "Người dùng không tồn tại — mở modal tạo tài khoản để tạo mới (vui lòng kiểm tra thông tin)."
            );
            if (typeof onRequestCreate === "function") {
              onRequestCreate(prefill);
            }
            setLoading(false);
            return;
          } catch (e) {
            console.error("Failed to handle missing user fallback", e);
            toast.error("Không thể xử lý trường hợp người dùng không tồn tại.");
            setLoading(false);
            return;
          }
        }
        // rethrow other errors to be handled by outer catch
        throw updateErr;
      }

      // update profile name if provided (robust: ensure parent exists then update)
      if (user.role === "parent") {
        try {
          // Ensure we have the authoritative parent record from server
          const parentsRes = await parentApi.getAllParents();
          const parentsList = parentsRes?.data ?? parentsRes ?? [];
          const existing = (parentsList || []).find((p) => {
            const uid =
              p.user_id ??
              p.userId ??
              (p.UserAccount && p.UserAccount.id) ??
              null;
            return String(uid) === String(user.id);
          });

          if (existing) {
            // update existing parent
            await parentApi.updateParent(existing.id, {
              parentData: { fullName: name },
            });
          } else {
            // create linked parent for this user
            await parentApi.linkParentToUser(user.id, {
              fullName: name,
              phone: "",
            });
          }
        } catch (e) {
          console.error("Failed to ensure/update parent profile", e);
          // Surface a clear toast to the user
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            "Không thể cập nhật hồ sơ phụ huynh";
          toast.error(msg);
        }
      } else if (user.role === "driver" && profile && (name || name === "")) {
        try {
          await updateDriver(profile.id, { driverData: { fullName: name } });
        } catch (e) {
          console.warn("Update driver profile failed", e);
        }
      }

      // Notify other pages that a user (or driver/parent) changed
      const entity =
        user.role === "driver"
          ? "driver"
          : user.role === "parent"
          ? "parent"
          : "user";
      emitEntityChange(entity);
      onSaved && onSaved();
    } catch (err) {
      console.error(err);
      // If user not found, show clearer message and refresh list
      if (err?.response?.status === 404) {
        toast.error(
          "Người dùng không tồn tại (có thể đã bị xóa). Đang cập nhật danh sách..."
        );
        emitEntityChange("user");
        onSaved && onSaved();
        setLoading(false);
        return;
      }
      const msg =
        err?.response?.data?.message || err?.message || "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm">ID</label>
        <input
          className="border px-2 py-1 w-full bg-gray-50"
          value={user.id}
          disabled
        />
      </div>
      <div>
        <label className="text-sm">Tên</label>
        <input
          className="border px-2 py-1 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập họ và tên"
          aria-label="Họ và tên"
        />
      </div>
      <div>
        <label className="text-sm">Username</label>
        <input
          className="border px-2 py-1 w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm">Email</label>
        <input
          className="border px-2 py-1 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 border rounded" onClick={onSaved}>
          Hủy
        </button>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
};

export default AccountManagement;
