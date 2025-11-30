import React, { useState, useEffect } from "react";
import AccountModal from "./AccountModal";
import parentApi from "../../api/parentApi";
import userApi from "../../api/userApi";
import { getAllDrivers, createDriver, updateDriver } from "../../api/driverApi";
import { toast } from "react-hot-toast";
import { emitEntityChange } from "../../utils/eventBus";
import { Plus, Eye, EyeOff } from "lucide-react";

const CreateAccountModal = ({
  open,
  onClose,
  onCreated,
  defaultRole = "parent",
  initialData = null,
  // If true, hide the role selector (useful when modal is used from a specific list page)
  hideRoleSelector = false,
  // If provided, force the role to this value (e.g. 'driver') and hide role selector
  forceRole = null,
}) => {
  const isEdit = Boolean(initialData);
  const [role, setRole] = useState(defaultRole);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [prefillId, setPrefillId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoDetectedDriver, setAutoDetectedDriver] = useState(false);

  useEffect(() => {
    // Auto-detect driver when initialData looks like a driver (has license or DRV id)
    if (initialData) {
      const looksLikeDriver =
        !!initialData.license_number ||
        !!initialData.licenseNumber ||
        (initialData.id &&
          typeof initialData.id === "string" &&
          initialData.id.startsWith("DRV")) ||
        (initialData.User && initialData.User.role === "driver");
      if (looksLikeDriver) {
        setAutoDetectedDriver(true);
        setRole("driver");
      }

      // If caller forces role, use it (and it will hide selector)
      if (forceRole) {
        setRole(forceRole);
      } else if (!looksLikeDriver) {
        setRole(initialData.role || defaultRole || "parent");
      }
      setName(initialData.full_name || initialData.fullName || "");
      setPrefillId(initialData.id || null);
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
      setConfirmPassword("");
      setPrefillId("");
      setName("");
      setPhone("");
      setLicenseNumber("");
    }
  }, [initialData, defaultRole, open]);

  // Debug: log props when modal opens so developer can inspect runtime values
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line no-console
      console.log("[CreateAccountModal] open with props:", {
        hideRoleSelector,
        forceRole,
        role,
        initialData,
      });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate password / confirm
    if (!isEdit) {
      // Create flows: parents must provide password; drivers optional
      if (role === "parent") {
        if (!password) {
          toast.error("Vui lòng nhập mật khẩu cho phụ huynh");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Mật khẩu và xác nhận mật khẩu không khớp");
          setLoading(false);
          return;
        }
      }

      if (role === "driver" && password) {
        if (password !== confirmPassword) {
          toast.error("Mật khẩu và xác nhận mật khẩu không khớp");
          setLoading(false);
          return;
        }
      }
    } else {
      // Edit flows: password is optional; if provided, must match confirm
      if (password) {
        if (password !== confirmPassword) {
          toast.error("Mật khẩu và xác nhận mật khẩu không khớp");
          setLoading(false);
          return;
        }
      }
    }

    const userData = {
      username: username?.trim(),
      email: email?.trim(),
    };
    if (password) {
      userData.password = password;
    } else if (!isEdit) {
      // creation fallback password
      userData.password = "changeme123";
    }

    // If modal was opened to create from an existing prefill (missing user), preserve the id
    if (prefillId) userData.id = prefillId;

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
            fullName: name,
            phone,
            licenseNumber: licenseNumber,
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
            fullName: name,
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
          fullName: name,
          phone,
        };
        // Ensure we provide IDs expected by backend models (User.id and Parent.id are required)
        const now = Date.now();
        const userPayload = { ...userData };
        if (!userPayload.id) userPayload.id = `U${now}`;
        const parentPayload = { ...parentData };
        if (!parentPayload.id) parentPayload.id = `P${now}`;

        await parentApi.createParent({
          userData: userPayload,
          parentData: parentPayload,
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
          fullName: name,
          phone,
          licenseNumber: licenseNumber,
        };

        try {
          // ensure user id exists for backend user model
          const userPayload = { ...userData };
          if (!userPayload.id) userPayload.id = `U${Date.now()}`;
          await createDriver({ userData: userPayload, driverData });
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

  // Determine title based on role and edit/create state
  const modalTitle = isEdit
    ? role === "driver"
      ? "Chỉnh sửa tài xế"
      : "Chỉnh sửa tài khoản"
    : role === "driver"
    ? "Tạo tài xế mới"
    : "Tạo tài khoản mới";

  return (
    <AccountModal open={open} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="modal-form">
        {/* Role selector - hidden when hideRoleSelector is true */}
        {!(hideRoleSelector || forceRole || autoDetectedDriver) && (
          <div className="form-group">
            <label
              style={{ marginBottom: 6, display: "block", fontWeight: 700 }}
            >
              Role
            </label>
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
        )}

        {/* Account fields: show for both parent and driver.
            For parents the fields are required; for drivers they are optional (you can provide username/email/password if desired). */}
        <>
          <div className="form-group">
            <label>ID</label>
            <input
              value={prefillId || ""}
              onChange={(e) => setPrefillId(e.target.value)}
              placeholder="User ID (optional)"
            />
          </div>
          <div className="form-group">
            <label>Username {role !== "driver" ? "*" : ""}</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required={role !== "driver"}
            />
          </div>

          <div className="form-group">
            <label>Email {role !== "driver" ? "*" : ""}</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required={role !== "driver"}
            />
          </div>

          <>
            <div className="form-group">
              <label>Password {role !== "driver" ? "*" : ""}</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required={!isEdit && role !== "driver"}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Xác nhận password {role !== "driver" ? "*" : ""}</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận password"
                  required={(!isEdit && role !== "driver") || Boolean(password)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>
          </>
        </>

        <div className="form-group">
          <label>Tên</label>
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
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-wrapper input {
          padding-right: 40px;
        }
        .password-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 6px;
          color: #495057;
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
