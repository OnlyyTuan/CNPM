// backend/src/middleware/authMiddleware.js

const { verifyToken } = require("../utils/jwt");
const { User } = require("../db"); // User Model đã được import

// ----------------------------------------------------
// Middleware xác thực JWT Token
// ----------------------------------------------------
exports.protect = async (req, res, next) => {
  let token;

  // 1. Kiểm tra Token trong Header Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2. Xác thực Token, lấy ra ID người dùng
      const decoded = verifyToken(token); // decoded chứa { id: 'Uxxx', iat: ..., exp: ... }

      if (!decoded) {
        // Lỗi này thường đã được verifyToken bắt (JWT expired/invalid signature)
        return res
          .status(401)
          .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
      }

      // ⭐️ ĐIỀU CHỈNH: 3. Tìm User trong DB để lấy Vai trò (Role)
      const currentUser = await User.findByPk(decoded.id, {
        attributes: ["id", "role"], // Chỉ lấy ID và Role
      });

      if (!currentUser) {
        return res
          .status(401)
          .json({ message: "Người dùng sở hữu token này không còn tồn tại." });
      }

      // 4. Gắn User ID và Role vào Request
      // req.user sẽ chứa { id: 'Uxxx', role: 'admin' }
      req.user = { id: currentUser.id, role: currentUser.role };

      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      // Xử lý lỗi từ jwt.verify (ví dụ: TokenExpiredError)
      return res
        .status(401)
        .json({ message: "Không được ủy quyền, Token thất bại." });
    }
  } else {
    // Nếu không tìm thấy token trong header
    return res
      .status(401)
      .json({ message: "Không được ủy quyền, không có Token." });
  }
};

// ----------------------------------------------------
// Middleware kiểm tra Vai trò (Role-based access control - RBAC)
// ----------------------------------------------------
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Kiểm tra xem req.user đã được thiết lập và vai trò có trong danh sách cho phép không
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Bạn không có quyền truy cập. Cần vai trò: ${roles.join(
          ", "
        )}`,
      });
    }
    next();
  };
};
