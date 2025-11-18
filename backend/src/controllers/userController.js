const userService = require("../services/userService");
const { sendTokenResponse } = require("../utils/jwt");

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
      return res
        .status(404)
        .json({ message: "Cập nhật thất bại hoặc không tìm thấy người dùng." });
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
