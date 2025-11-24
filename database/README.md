# Database Setup - SmartSchoolBus

## 📋 Thông tin Database

- **Tên database:** `smartschoolbus`
- **User:** `root`
- **Password:** `thinh2014`
- **Port:** `3306` (mặc định)
- **Charset:** `utf8mb4`

## 🚀 Cách cài đặt Database

### Bước 1: Cài đặt MySQL Server

- **Windows:** Tải [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) hoặc dùng XAMPP
- **Mac:** `brew install mysql`
- **Linux:** `sudo apt install mysql-server`

### Bước 2: Import Database

#### Cách 1: Dùng Command Line (Khuyến nghị)

```bash
# Tạo database trống
mysql -u root -pthinh2014 -e "CREATE DATABASE IF NOT EXISTS smartschoolbus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import file backup
mysql -u root -pthinh2014 smartschoolbus < database/smartschoolbus_backup.sql
```

**PowerShell (Windows):**
```powershell
mysql -u root -pthinh2014 -e "CREATE DATABASE IF NOT EXISTS smartschoolbus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Get-Content database/smartschoolbus_backup.sql | mysql -u root -pthinh2014 smartschoolbus
```

#### Cách 2: Dùng MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối với MySQL Server (root/thinh2014)
3. Click **Server** → **Data Import**
4. Chọn **Import from Self-Contained File**
5. Browse đến file `database/smartschoolbus_backup.sql`
6. Click **Start Import**

### Bước 3: Kiểm tra

```sql
USE smartschoolbus;
SHOW TABLES;
SELECT COUNT(*) FROM student;
SELECT COUNT(*) FROM bus;
```

## 📦 Các file SQL trong project

- **`smartschoolbus_backup.sql`** - ⭐ **FILE CHÍNH** - Full backup database (dùng file này)
- **`init.sql`** - File khởi tạo cũ (không dùng nữa)
- **`add-route-waypoints.sql`** - Script thêm waypoints (đã có trong backup)

## 🔄 Cập nhật Database (Cho Dev)

Khi có thay đổi database, export lại:

```bash
mysqldump -u root -pthinh2014 smartschoolbus > database/smartschoolbus_backup.sql
git add database/smartschoolbus_backup.sql
git commit -m "Update database backup"
git push
```

## ⚠️ Lưu ý

- **Password mặc định:** `thinh2014` - Hãy đổi nếu deploy production
- **Charset:** Luôn dùng `utf8mb4` để hỗ trợ tiếng Việt
- **Port:** Đảm bảo MySQL chạy trên port 3306
- **Firewall:** Nếu MySQL không kết nối được, kiểm tra firewall

## 🐛 Troubleshooting

### Lỗi: "Access denied for user 'root'@'localhost'"
```bash
# Reset password MySQL
ALTER USER 'root'@'localhost' IDENTIFIED BY 'thinh2014';
FLUSH PRIVILEGES;
```

### Lỗi: "Unknown database 'smartschoolbus'"
```bash
CREATE DATABASE smartschoolbus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Lỗi: "Table doesn't exist"
```bash
# Import lại database
mysql -u root -pthinh2014 smartschoolbus < database/smartschoolbus_backup.sql
```

## 📊 Cấu trúc Database

Database gồm các bảng chính:
- `student` - Danh sách học sinh (7 records)
- `bus` - Xe buýt (3 records: B001, B002, B003)
- `driver` - Tài xế
- `route` - Tuyến đường (R001, R002)
- `route_waypoint` - Điểm dừng trên tuyến
- `location` - Vị trí/điểm dừng
- `parent` - Phụ huynh
- `schedule` - Lịch trình
- `assignment` - Phân công xe/học sinh

## 📞 Hỗ trợ

Nếu gặp vấn đề khi import database, liên hệ team lead.
