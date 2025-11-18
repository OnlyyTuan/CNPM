// backend/src/controllers/authController.js
// Controller xử lý đăng nhập

const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/app.config');

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ username và password'
            });
        }

        // Tìm user trong database
        const [users] = await db.query(
            'SELECT * FROM user WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        const user = users[0];

        // Kiểm tra password (trong database là plain text, nên so sánh trực tiếp)
        // TODO: Nên hash password trong database để bảo mật hơn
        if (password !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                role: user.role 
            },
            config.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Trả về thông tin user và token
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng nhập'
        });
    }
};

// Lấy thông tin user hiện tại
exports.me = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ middleware xác thực

        const [users] = await db.query(
            'SELECT id, username, email, role FROM user WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};
