import React, { useState, useEffect } from "react";
import AccountModal from "./AccountModal";
import parentApi from "../../api/parentApi";
import userApi from "../../api/userApi";
import { getAllDrivers, createDriver, updateDriver } from "../../api/driverApi";
import { toast } from "react-hot-toast";
import { emitEntityChange } from "../../utils/eventBus";
import { Plus } from "lucide-react";

const CreateAccountModal = ({
  open,
  onClose,
  onCreated,
  defaultRole = "parent",
  initialData = null,
}) => {
  const isEdit = Boolean(initialData);
  const [role, setRole] = useState(defaultRole);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRole(initialData.role || defaultRole || "parent");
      setName(initialData.full_name || initialData.fullName || "");
      setPhone(initialData.phone || "");
      setLicenseNumber(
        initialData.license_number || initialData.licenseNumber || ""
      );
      if (initialData.User) {
        setUsername(initialData.User.username || "");
        setEmail(initialData.User.email || "");
      } else {
        setUsername(initialData.username || "");
        setEmail(initialData.email || "");
      }
    } else {
      setRole(defaultRole);
      setUsername("");
      setEmail("");
      setPassword("");
      setName("");
      setPhone("");
      setLicenseNumber("");
    }
  }, [initialData, defaultRole, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      username: username?.trim(),
      email: email?.trim(),
      password: password || "changeme123",
    };

    try {
      if (isEdit && initialData) {
        // Update flows
        // Defensive: ensure we have a valid id to update
        if (!initialData.id || initialData.id === "DEFAULT_PARENT_USER") {
          toast.error("ID không hợp lệ, không thể cập nhật tài khoản này.");
          setLoading(false);
          return;
        }

        if (role === "driver") {
          const driverData = {
            full_name: name,
            phone,
            license_number: licenseNumber,
          };
          try {
            await updateDriver(initialData.id, { driverData, userData });
            toast.success("Cập nhật tài xế thành công");
            emitEntityChange("driver");
          } catch (err) {
            if (err?.response?.status === 404) {
              toast.error("Tài xế không tồn tại (đã bị xóa). Đang làm mới.");
              emitEntityChange("driver");
              onClose && onClose();
              return;
            }
            throw err;
          }
        } else {
          const parentData = {
            full_name: name,
            phone,
          };
          try {
            await parentApi.updateParent(initialData.id, {
              parentData,
              userData,
            });
            toast.success("Cập nhật phụ huynh thành công");
            emitEntityChange("parent");
          } catch (err) {
            if (err?.response?.status === 404) {
              toast.error("Phụ huynh không tồn tại (đã bị xóa). Đang làm mới.");
              emitEntityChange("parent");
              onClose && onClose();
              return;
            }
            throw err;
          }
        }

        onCreated && onCreated();
        onClose && onClose();
        return;
      }

      // Creation flows
      if (role === "parent") {
        const parentData = {
          full_name: name,
          phone,
        };
        await parentApi.createParent({
          userData,
          parentData,
          studentData: null,
        });
        toast.success("Tạo phụ huynh thành công");
        emitEntityChange("parent");
        onCreated && onCreated();
        onClose && onClose();
      } else {
        // driver creation: client-side quick checks
        try {
          const usersRes = await userApi.getAllUsers();
          const users = usersRes?.data ?? usersRes;
          const existingUser = (users || []).find(
            (u) =>
              (u.username && u.username === userData.username) ||
              (u.email && userData.email && u.email === userData.email)
          );
          if (existingUser) {
            toast.error("Username hoặc email đã tồn tại");
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Không thể kiểm tra users trước khi tạo:", err);
        }

        try {
          const drivers = await getAllDrivers();
          const dup = (drivers || []).find((d) => {
            const dPhone = d.phone || (d.User && d.User.phone) || null;
            const dEmail = (d.User && d.User.email) || null;
            return (
              (phone && dPhone && dPhone === phone) ||
              (licenseNumber &&
                d.license_number &&
                d.license_number === licenseNumber) ||
              (userData.email && dEmail && dEmail === userData.email)
            );
          });
          if (dup) {
            toast.error("Số điện thoại, email hoặc số GPLX đã tồn tại");
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Không thể kiểm tra drivers trước khi tạo:", err);
        }

        const driverData = {
          id: `DRV${Date.now()}`,
          full_name: name,
          phone,
          license_number: licenseNumber,
        };

        try {
          await createDriver({ userData, driverData });
          toast.success("Tạo tài xế thành công");
          emitEntityChange("driver");
          onCreated && onCreated();
          onClose && onClose();
        } catch (err) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Tạo tài xế thất bại";
          console.error("Create driver error:", err);
          toast.error(msg);
        }
      }
    } catch (err) {
      console.error("Create account error", err);
      toast.error("Tạo tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {/* Role selector */}
        <div className="form-group">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <label
              className={`px-3 py-1 rounded-full cursor-pointer text-sm font-medium ${
                role === "parent" ? "bg-white shadow" : "text-gray-700"
              }`}
            >
              <input
                type="radio"
                checked={role === "parent"}
                onChange={() => setRole("parent")}
                className="hidden"
              />
              Phụ huynh
            </label>
            <label
              className={`px-3 py-1 rounded-full cursor-pointer text-sm font-medium ${
                role === "driver" ? "bg-white shadow" : "text-gray-700"
              }`}
            >
              <input
                type="radio"
                checked={role === "driver"}
                onChange={() => setRole("driver")}
                className="hidden"
              />
              Tài xế
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Username *</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>

        {!isEdit && (
          <div className="form-group">
            <label>Password *</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Họ và tên</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
          />
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
          />
        </div>

        {role === "driver" && (
          <div className="form-group">
            <label>Số GPLX</label>
            <input
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="License number"
            />
          </div>
        )}

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-cancel">
            Hủy
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            <Plus size={16} />
            <span>
              {loading ? "Đang lưu..." : isEdit ? "Lưu" : "Tạo tài khoản"}
            </span>
          </button>
        </div>
      </form>
      <style>{`
        .modal-form {
          padding: 10px 6px;
          max-height: 70vh;
          overflow: auto;
        }
        .form-group {
          margin-bottom: 12px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #343a40;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #dee2e6;
        }
        .btn-cancel {
          padding: 10px 18px;
          border: 1px solid #6c757d;
          background-color: white;
          color: #6c757d;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-submit {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: none;
          background-color: #28a745;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </AccountModal>
  );
};

export default CreateAccountModal;
