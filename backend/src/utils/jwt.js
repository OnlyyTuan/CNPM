// backend/src/utils/jwt.js

const jwt = require('jsonwebtoken');

// Hàm tạo Token JWT
const createToken = (id) => {
    // Sử dụng SECRET_KEY từ biến môi trường
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN 
    });
};

// Hàm gửi Token dưới dạng cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = createToken(user.id);

    const options = {
        // Ngày hết hạn dựa trên JWT_COOKIE_EXPIRES_IN (ví dụ: '30d')
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), 
        httpOnly: true, // Không cho phép truy cập qua JavaScript (bảo mật)
    };

    // Thêm cờ 'secure' nếu đang ở môi trường sản phẩm (HTTPS)
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // 1. Đặt token vào cookie
    res.cookie('token', token, options);

    // 2. Trả về response JSON
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
};

// Hàm xác thực token (sẽ được dùng trong authMiddleware.js)
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};


module.exports = {
    createToken,
    sendTokenResponse,
    verifyToken
};