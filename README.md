# 🚍 Hệ thống Quản lý Xe Buýt

## 🛠️ Yêu cầu cài đặt

- **Node.js 18+**: [https://nodejs.org/](https://nodejs.org/)  
- **MySQL**: [https://dev.mysql.com/downloads/windows/installer/](https://dev.mysql.com/downloads/windows/installer/)  
- **Git** (Git Bash): [https://git-scm.com/](https://git-scm.com/)  

---

## ⚡ Cài đặt project

Mở Terminal hoặc Git Bash và chạy các lệnh sau:

```bash
# Clone source code về máy
git clone https://github.com/OnlyyTuan/CNPM.git
cd CNPM

# Cài đặt backend
cd backend
npm install

# Cài đặt frontend
cd ../frontend
npm install
```
## 🗄️ Cấu hình cơ sở dữ liệu

### 1️⃣ Tạo database

```sql
mysql -u root -p
CREATE DATABASE smartschoolbus;
exit

mysql -u root -p smartschoolbus < backend/database.sql
```
