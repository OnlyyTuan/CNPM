// backend/src/controllers/authController.js
// Controller xử lý đăng nhập

const db = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/app.config");

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ username và password",
      });
    }

    // Tìm user trong database
    const [users] = await db.query("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    const user = users[0];

    // Kiểm tra password: database lưu password đã băm (thông thường), so sánh bằng bcrypt
    // Nếu DB chứa mật khẩu plaintext (còn sót từ seed), cho phép so sánh trực tiếp
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      isMatch = false;
    }

    // Nếu bcrypt.compare trả về false, kiểm tra fallback: mật khẩu lưu plaintext
    if (!isMatch) {
      if (user.password === password) {
        // Plaintext match detected; upgrade stored password to hashed value
        try {
          const hashedNew = await bcrypt.hash(password, config.SALT_ROUNDS);
          await db.query("UPDATE user SET password = ? WHERE id = ?", [
            hashedNew,
            user.id,
          ]);
          isMatch = true;
          // Replace in-memory password for downstream use
          user.password = hashedNew;
        } catch (e) {
          console.error("Error upgrading plaintext password:", e);
        }
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      config.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Trả về thông tin user và token
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
    });
  }
};

// Lấy thông tin user hiện tại
exports.me = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware xác thực

    const [users] = await db.query(
      "SELECT id, username, email, role FROM user WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
