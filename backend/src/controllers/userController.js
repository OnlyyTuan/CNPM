const userService = require("../services/userService");
const { sendTokenResponse } = require("../utils/jwt");
const bcrypt = require("bcryptjs");
const config = require("../config/app.config");

// ====================================================
// CHỨC NĂNG XÁC THỰC (AUTH)
// ====================================================

/**
 * [POST] /api/v1/auth/register - Đăng ký (Public)
 * Cho phép đăng ký role PARENT (chính) hoặc DRIVER (qua một endpoint khác, ví dụ: createDriverAndUser)
 */
exports.register = async (req, res, next) => {
  try {
    // Gọi service để tạo User và profile liên kết (Parent/Driver)
    // Service sẽ tự xử lý băm mật khẩu và Transaction
    const newUser = await userService.createUser(req.body);

    // Sau khi tạo thành công, tự động đăng nhập và gửi token
    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    if (error.message.includes("đã tồn tại")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * [POST] /api/v1/auth/login - Đăng nhập (Public)
 */
exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp tên đăng nhập và mật khẩu." });
  }

  try {
    const user = await userService.loginUser(username, password);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.message.includes("Tên đăng nhập hoặc mật khẩu không đúng")) {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * [GET] /api/v1/auth/logout - Đăng xuất (Public)
 */
exports.logout = (req, res) => {
  // Xóa cookie token
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // Hết hạn ngay lập tức
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Đăng xuất thành công." });
};

// ====================================================
// CHỨC NĂNG CRUD (Dành cho ADMIN)
// ====================================================

/**
 * [GET] /api/v1/users - Lấy danh sách User
 * Yêu cầu: ADMIN
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /api/v1/users/:id - Lấy chi tiết User
 * Yêu cầu: ADMIN
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * [PUT] /api/v1/users/:id - Cập nhật thông tin User
 * Yêu cầu: ADMIN
 */
exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    if (!updatedUser) {
      // Note: User.update returns affected==0 when no fields changed — in that case
      // the user may still exist. Check for that first to avoid attempting to create
      // a duplicate primary key.
      try {
        const db = require("../db");
        const id = req.params.id;

        const existingDbUser = await db.User.findByPk(id);
        if (existingDbUser) {
          // No changes were applied, but the user exists — return current record
          return res.status(200).json(existingDbUser);
        }

        // Nếu user không tồn tại, cố gắng tạo user mới nếu có Parent/Driver liên kết
        const existingParent = await db.Parent.findOne({
          where: { userId: id },
        });
        const existingDriver = await db.Driver.findOne({
          where: { userId: id },
        });

        if (!existingParent && !existingDriver) {
          return res.status(404).json({
            message: "Cập nhật thất bại hoặc không tìm thấy người dùng.",
          });
        }

        // Create a user with provided payload (or sensible defaults)
        let username = req.body.username || String(id);
        // User.email is non-null in the model; provide a generated fallback email
        let email = req.body.email || `${id}@noemail.local`;
        const rawPassword = req.body.password || "123456";
        const hashed = await bcrypt.hash(rawPassword, config.SALT_ROUNDS);
        const role = existingDriver ? "driver" : "parent";

        // Avoid unique constraint collisions: if username/email already used by other user, fall back
        const existingByUsername = username
          ? await db.User.findOne({ where: { username } })
          : null;
        if (existingByUsername && existingByUsername.id !== id) {
          username = String(id);
        }

        if (email) {
          const existingByEmail = await db.User.findOne({ where: { email } });
          if (existingByEmail && existingByEmail.id !== id) {
            // If email conflicts, fall back to a generated unique email using the id
            email = `${id}@noemail.local`;
          }
        }

        const newUser = await db.User.create({
          id,
          username,
          email,
          password: hashed,
          role,
        });

        return res.status(201).json({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          message: "User không tồn tại — đã tạo user tạm và áp dụng thông tin.",
        });
      } catch (e) {
        console.error("updateUser fallback error", e);
        return res.status(500).json({
          message: "Lỗi khi tạo user tạm thời.",
          error: e.message,
          errors: e.errors || null,
        });
      }
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    // Handle Sequelize unique constraint errors to return a friendly 400
    if (
      error &&
      (error.name === "SequelizeUniqueConstraintError" ||
        error.name === "UniqueConstraintError")
    ) {
      const field =
        (error.errors && error.errors[0] && error.errors[0].path) || "field";
      return res.status(400).json({ message: `Giá trị ${field} đã tồn tại.` });
    }
    next(error);
  }
};

/**
 * [DELETE] /api/v1/users/:id - Xóa User
 * Yêu cầu: ADMIN
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    if (result === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng để xóa." });
    }
    res.status(204).json(null);
  } catch (error) {
    next(error);
  }
};

/**
 * [PUT] /api/v1/users/:id/password - Admin sets a new password for a user
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body || {};
    if (!password || String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới không hợp lệ (ít nhất 6 ký tự)." });
    }

    const hashed = await bcrypt.hash(password, config.SALT_ROUNDS);

    const updated = await userService.updateUser(id, { password: hashed });

    // Nếu không tìm thấy user để cập nhật, thử tạo user tạm dựa trên profile (Parent/Driver)
    if (!updated) {
      try {
        const db = require("../db");
        // Kiểm tra Parent liên kết
        const existingParent = await db.Parent.findOne({
          where: { userId: id },
        });
        if (existingParent) {
          // Tạo user mới với id được chỉ định (username tạm lấy từ id để tránh trùng)
          const username = String(id);
          // Ensure email is not null (model requires non-null). Use parent's email if present, otherwise a generated one.
          const fallbackEmail = existingParent.email || `${id}@noemail.local`;
          const newUser = await db.User.create({
            id,
            username,
            password: hashed,
            email: fallbackEmail,
            role: "parent",
          });
          return res.status(201).json({
            message: "User không tồn tại — đã tạo user và đặt mật khẩu.",
          });
        }

        // Kiểm tra Driver liên kết
        const existingDriver = await db.Driver.findOne({
          where: { userId: id },
        });
        if (existingDriver) {
          const username = String(id);
          // Drivers may not have email on profile; use generated fallback email to satisfy model
          const fallbackEmail = `${id}@noemail.local`;
          const newUser = await db.User.create({
            id,
            username,
            password: hashed,
            email: fallbackEmail,
            role: "driver",
          });
          return res.status(201).json({
            message: "User không tồn tại — đã tạo user và đặt mật khẩu.",
          });
        }

        // Nếu không tìm thấy profile liên kết, trả về 404 như trước
        return res.status(404).json({ message: "Người dùng không tồn tại." });
      } catch (e) {
        console.error("updatePassword fallback error", e);
        return res.status(500).json({
          message: "Lỗi khi tạo user tạm thời.",
          error: e.message,
          errors: e.errors || null,
        });
      }
    }

    return res.status(200).json({ message: "Đặt mật khẩu mới thành công." });
  } catch (error) {
    console.error("updatePassword error", error);
    next(error);
  }
};
