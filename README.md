# 🚍 Smart School Bus - Hệ thống Theo dõi Xe Buýt Real-time

Hệ thống quản lý và theo dõi vị trí xe buýt trường học theo thời gian thực với hiển thị lộ trình trên bản đồ.

---

## 🛠️ Yêu cầu hệ thống

- **Node.js 18+**: [Download](https://nodejs.org/)
- **MySQL 8.0+**: [Download](https://dev.mysql.com/downloads/mysql/)
- **Git**: [Download](https://git-scm.com/)

---

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/OnlyyTuan/CNPM.git
cd CNPM
```

### 2. Cài đặt dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## ⚙️ Cấu hình

### 🗄️ Database

#### Bước 1: Tạo database

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database
CREATE DATABASE smartschoolbus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### Bước 2: Import schema và dữ liệu mẫu

```bash
# Import schema chính
mysql -u root -p smartschoolbus < database/init.sql

# Import waypoints cho tuyến đường
mysql -u root -p smartschoolbus < database/add-route-waypoints.sql
```

### 🔧 Backend Configuration

Tạo file `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - THAY ĐỔI MẬT KHẨU CỦA BẠN
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=smartschoolbus

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

⚠️ **LƯU Ý**: Thay đổi `DB_PASSWORD` thành mật khẩu MySQL của mình!

### 🎨 Frontend Configuration

File `frontend/src/config/api.config.js` mặc định đã cấu hình:

```javascript
export const API_BASE_URL = 'http://localhost:5000/api/v1';
```

Nếu backend chạy port khác, sửa lại URL này.

---

## 🚀 Chạy ứng dụng

### Terminal 1: Backend Server

```bash
cd backend
npm start
```

✅ Backend chạy tại: **http://localhost:5000**

### Terminal 2: Frontend Dev Server

```bash
cd frontend
npm run dev
```

✅ Frontend chạy tại: **http://localhost:5173**

### Terminal 3: Bus Simulator (Optional)

```bash
cd backend
node bus-simulator.js
```

✅ Simulator sẽ giả lập 3 xe (B001, B002, B003) di chuyển theo tuyến đường


---

## 📂 Cấu trúc project

```
CNPM/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation
│   │   └── config/          # Database, app config
│   ├── bus-simulator.js     # Giả lập xe di chuyển
│   └── .env                 # ⚠️ Cần tạo file này
│
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── pages/           # Live tracking, Dashboard
│   │   ├── components/      # UI components
│   │   ├── api/             # API client functions
│   │   └── config/          # Frontend config
│   └── public/
│
├── database/                 # SQL scripts
│   ├── init.sql             # Schema + sample data
│   └── add-route-waypoints.sql  # Route waypoints
│
└── README.md
```

---

## 🗺️ Database Schema (Chính)

- **users**: Tài khoản người dùng (admin, driver, parent)
- **drivers**: Thông tin tài xế
- **buses**: Danh sách xe bus
- **students**: Học sinh
- **parents**: Phụ huynh
- **routes**: Tuyến đường
- **route_waypoint**: Điểm dừng trên tuyến
- **schedules**: Lịch trình
- **locations**: Vị trí real-time của xe

---

## 🔍 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký

### Live Tracking
- `GET /api/v1/buses/live-location` - Lấy vị trí tất cả xe
- `PUT /api/v1/buses/:id/location` - Cập nhật vị trí xe

### Routes
- `GET /api/v1/routes` - Danh sách tuyến đường
- `GET /api/v1/routes/:id/waypoints` - ⭐ Lấy waypoints của tuyến (MỚI)

### Management
- Buses: `/api/v1/buses`
- Drivers: `/api/v1/drivers`
- Students: `/api/v1/students`
- Parents: `/api/v1/parents`
- Schedules: `/api/v1/schedules`

---

## 🐛 Troubleshooting

### ❌ Lỗi kết nối database

```
Error: Access denied for user 'root'@'localhost'
```

**Giải pháp**: Kiểm tra lại `DB_PASSWORD` trong file `backend/.env`

### ❌ Port đã được sử dụng

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Giải pháp**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### ❌ Frontend không kết nối được backend

Kiểm tra:
1. Backend đã chạy chưa? (`http://localhost:5000/api/v1/health`)
2. URL trong `frontend/src/config/api.config.js` đúng chưa?
3. CORS đã enable trong backend chưa? (đã config sẵn)

### ❌ Xe không di chuyển trên bản đồ

1. Kiểm tra bus simulator đã chạy chưa
2. Mở DevTools Console xem có lỗi không
3. Xem log backend terminal có cập nhật vị trí không

---

## 📚 Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **Sequelize ORM** - Database modeling
- **MySQL** - Relational database
- **JWT** - Authentication
- **Axios** - HTTP client (simulator)

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Leaflet** + **React-Leaflet** - Interactive maps
- **Axios** - API client
- **Tailwind CSS** - Styling

---

## 👥 Nhóm phát triển

- Tường Huy - Real-time tracking & Route visualization
- [Thêm tên thành viên khác]

---

## 📝 License

This project is for educational purposes.

---

## 🆘 Liên hệ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ nhóm phát triển.

---

**🎉 Chúc bạn setup thành công!**