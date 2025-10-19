-- ===================================
-- BẢNG THỰC THỂ (ENTITIES)
-- ===================================
DROP DATABASE IF EXISTS smartschoolbus;
CREATE DATABASE smartschoolbus;
USE smartschoolbus;

CREATE TABLE `Location` (
    `id` VARCHAR(255) NOT NULL, -- Mã định danh vị trí (Khóa chính)
    `name` VARCHAR(255),        -- Tên điểm (ví dụ: Trường A, Điểm đón số 3)
    `address` VARCHAR(255),     -- Địa chỉ chi tiết
    `latitude` DECIMAL(10, 8),  -- Vĩ độ (tọa độ GPS)
    `longitude` DECIMAL(11, 8), -- Kinh độ (tọa độ GPS)
    `type` VARCHAR(50),         -- Loại vị trí (ví dụ: PICKUP_POINT, SCHOOL)
    `estimatedTime` TIME,       -- Thời gian ước tính đến điểm này
    PRIMARY KEY (`id`)          -- Định nghĩa Khóa chính
);

CREATE TABLE `Driver` (
    `id` VARCHAR(255) NOT NULL, -- Mã tài xế (Khóa chính)
    `name` VARCHAR(255),        -- Họ và tên tài xế
    `phone` VARCHAR(20),        -- Số điện thoại liên hệ
    `licenseNumber` VARCHAR(50),-- Số giấy phép lái xe
    `experience` INT,           -- Số năm kinh nghiệm
    `status` VARCHAR(50),       -- Trạng thái hiện tại (ví dụ: DRIVING, OFF_DUTY)
    `currentBus_id` VARCHAR(255), -- Mã xe đang lái (Khóa ngoại tham chiếu đến Bus)
    PRIMARY KEY (`id`),         -- Định nghĩa Khóa chính
    UNIQUE (`licenseNumber`)    -- Số GPLX là duy nhất
);

CREATE TABLE `Bus` (
    `id` VARCHAR(255) NOT NULL, -- Mã xe buýt (Khóa chính)
    `capacity` INT,             -- Sức chứa tối đa của xe
    `currentLocation_id` VARCHAR(255), -- Mã vị trí hiện tại của xe (Khóa ngoại tham chiếu đến Location)
    `status` VARCHAR(50),       -- Trạng thái xe (ví dụ: ACTIVE, MAINTENANCE)
    `speed` DECIMAL(5, 2),      -- Vận tốc hiện tại (km/h)
    `lastUpdate` TIMESTAMP,     -- Thời điểm cập nhật vị trí cuối cùng
    `route_id` VARCHAR(255),    -- Mã tuyến đường đang chạy (Khóa ngoại tham chiếu đến Route)
    `driver_id` VARCHAR(255) UNIQUE, -- Mã tài xế đang lái (Khóa ngoại tham chiếu đến Driver)
    PRIMARY KEY (`id`)          -- Định nghĩa Khóa chính
);

CREATE TABLE `Route` (
    `id` VARCHAR(255) NOT NULL, -- Mã tuyến đường (Khóa chính)
    `name` VARCHAR(255),        -- Tên tuyến đường (ví dụ: Tuyến A, Tuyến buổi sáng)
    `estimatedDuration` INT,    -- Thời gian ước tính hoàn thành tuyến (phút)
    `distance` DECIMAL(10, 2),  -- Tổng quãng đường (km)
    `startTime` TIME,           -- Thời gian bắt đầu dự kiến
    `endTime` TIME,             -- Thời gian kết thúc dự kiến
    PRIMARY KEY (`id`)          -- Định nghĩa Khóa chính
);

CREATE TABLE `Student` (
    `id` VARCHAR(255) NOT NULL, -- Mã học sinh (Khóa chính)
    `name` VARCHAR(255),        -- Họ và tên học sinh
    `class` VARCHAR(50),        -- Lớp học
    `grade` INT,                -- Khối lớp (ví dụ: 1, 2, 3...)
    `parentContact` VARCHAR(20),-- Số điện thoại phụ huynh
    `status` VARCHAR(50),       -- Trạng thái học sinh (ví dụ: ON_BUS, AT_SCHOOL)
    `assignedBus_id` VARCHAR(255), -- Mã xe được phân công (Khóa ngoại tham chiếu đến Bus)
    `pickupLocation_id` VARCHAR(255), -- Mã điểm đón (Khóa ngoại tham chiếu đến Location)
    `dropoffLocation_id` VARCHAR(255), -- Mã điểm trả (Khóa ngoại tham chiếu đến Location)
    `parent_id` VARCHAR(255),   -- Mã phụ huynh (Khóa ngoại tham chiếu đến Parent, cho phép 1 parent có nhiều student)
    PRIMARY KEY (`id`)          -- Định nghĩa Khóa chính
);

CREATE TABLE `Schedule` (
    `id` VARCHAR(255) NOT NULL, -- Mã lịch trình (Khóa chính)
    `date` DATE,                -- Ngày diễn ra lịch trình
    `time` TIME,                -- Thời gian bắt đầu
    `status` VARCHAR(50),       -- Trạng thái lịch trình (ví dụ: PLANNED, ONGOING)
    `bus_id` VARCHAR(255),      -- Mã xe sử dụng (Khóa ngoại tham chiếu đến Bus)
    `driver_id` VARCHAR(255),   -- Mã tài xế (Khóa ngoại tham chiếu đến Driver)
    `route_id` VARCHAR(255),    -- Mã tuyến đường (Khóa ngoại tham chiếu đến Route)
    PRIMARY KEY (`id`)          -- Định nghĩa Khóa chính
);

CREATE TABLE `Message` (
    `id` INT AUTO_INCREMENT NOT NULL, -- Mã tin nhắn (Khóa chính tự tăng)
    `sender_type` VARCHAR(50),  -- Loại người gửi (DRIVER, PARENT, SYSTEM)
    `sender_id` VARCHAR(255),   -- Mã người gửi (tùy loại)
    `recipient_id` VARCHAR(255) NOT NULL, -- Mã người nhận (học sinh hoặc phụ huynh)
    `message_content` TEXT NOT NULL, -- Nội dung tin nhắn
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời gian gửi
    `is_read` BOOLEAN DEFAULT FALSE, -- Trạng thái đã đọc
    PRIMARY KEY (`id`)          -- Định nghĩa Khóa chính
);

CREATE TABLE `Route_Stop` (
    `route_id` VARCHAR(255) NOT NULL, -- Mã tuyến đường (Khóa ngoại tham chiếu đến Route)
    `location_id` VARCHAR(255) NOT NULL, -- Mã điểm dừng (Khóa ngoại tham chiếu đến Location)
    `stop_order` INT,           -- Thứ tự dừng (ví dụ: 1, 2, 3...)
    PRIMARY KEY (`route_id`, `location_id`) -- Khóa chính composite
);

CREATE TABLE `Schedule_Student` (
    `schedule_id` VARCHAR(255) NOT NULL, -- Mã lịch trình (Khóa ngoại tham chiếu đến Schedule)
    `student_id` VARCHAR(255) NOT NULL, -- Mã học sinh (Khóa ngoại tham chiếu đến Student)
    `pickup_status` VARCHAR(50), -- Trạng thái đón (ví dụ: PICKED_UP, MISSED)
    PRIMARY KEY (`schedule_id`, `student_id`) -- Khóa chính composite
);

CREATE TABLE `LocationLog` (
    `id` INT AUTO_INCREMENT NOT NULL, -- Mã log (Khóa chính tự tăng)
    `bus_id` VARCHAR(255) NOT NULL, -- Mã xe (Khóa ngoại tham chiếu đến Bus)
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời điểm ghi nhận
    `latitude` DECIMAL(10, 8),  -- Vĩ độ
    `longitude` DECIMAL(11, 8), -- Kinh độ
    `speed` DECIMAL(5, 2),      -- Vận tốc tại thời điểm
    PRIMARY KEY (`id`)          -- Định nghĩa Khóa chính
);

-- Thêm bảng user để quản lý tài khoản và phân loại vai trò (admin, driver, parent)
CREATE TABLE `user` (
    `id` VARCHAR(255) NOT NULL, -- Mã định danh người dùng (Khóa chính)
    `username` VARCHAR(50) UNIQUE NOT NULL, -- Tên đăng nhập duy nhất
    `password` VARCHAR(255) NOT NULL, -- Mật khẩu (hashed)
    `email` VARCHAR(255) UNIQUE NOT NULL, -- Email duy nhất
    `role` VARCHAR(50) NOT NULL, -- Vai trò: ADMIN, DRIVER, PARENT
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Thời gian cập nhật
    `reset_token` VARCHAR(255) DEFAULT NULL, -- Token reset password
    `reset_expiry` DATETIME DEFAULT NULL, -- Thời hạn reset password (sử dụng DATETIME thay vì TIMESTAMP)
    PRIMARY KEY (`id`) -- Định nghĩa Khóa chính
);

-- Thêm bảng parent để quản lý thông tin phụ huynh, liên kết với user và student
CREATE TABLE `parent` (
    `id` VARCHAR(255) NOT NULL, -- Mã định danh phụ huynh (Khóa chính)
    `name` VARCHAR(255), -- Họ và tên phụ huynh
    `phone` VARCHAR(20), -- Số điện thoại
    `address` VARCHAR(255), -- Địa chỉ
    `user_id` VARCHAR(255) NOT NULL, -- Mã người dùng (Khóa ngoại tham chiếu đến user)
    PRIMARY KEY (`id`), -- Định nghĩa Khóa chính
    UNIQUE (`user_id`) -- Mỗi user chỉ có một parent (nếu role PARENT)
);

-- ===================================
-- KHÓA NGOẠI (FOREIGN KEYS)
-- ===================================

-- Khóa ngoại trên bảng DRIVER
ALTER TABLE `Driver`
ADD CONSTRAINT `FK_Driver_Bus`
FOREIGN KEY (`currentBus_id`) REFERENCES `Bus` (`id`) -- Tài xế đang lái xe nào
ON DELETE SET NULL ON UPDATE CASCADE;

-- Khóa ngoại trên bảng BUS
ALTER TABLE `Bus`
ADD CONSTRAINT `FK_Bus_Driver`
FOREIGN KEY (`driver_id`) REFERENCES `Driver` (`id`) -- Xe được phân công cho tài xế nào
ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Bus_Route`
FOREIGN KEY (`route_id`) REFERENCES `Route` (`id`) -- Xe đang chạy tuyến nào
ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Bus_Location`
FOREIGN KEY (`currentLocation_id`) REFERENCES `Location` (`id`) -- Vị trí hiện tại của xe
ON DELETE SET NULL ON UPDATE CASCADE;

-- Khóa ngoại trên bảng STUDENT
ALTER TABLE `Student`
ADD CONSTRAINT `FK_Student_Bus`
FOREIGN KEY (`assignedBus_id`) REFERENCES `Bus` (`id`) -- Học sinh được xếp vào xe nào
ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Student_PickupLocation`
FOREIGN KEY (`pickupLocation_id`) REFERENCES `Location` (`id`) -- Điểm đón của học sinh
ON DELETE RESTRICT ON UPDATE CASCADE, -- Không cho phép xóa điểm đón nếu có học sinh dùng
ADD CONSTRAINT `FK_Student_DropoffLocation`
FOREIGN KEY (`dropoffLocation_id`) REFERENCES `Location` (`id`) -- Điểm trả của học sinh
ON DELETE RESTRICT ON UPDATE CASCADE, -- Không cho phép xóa điểm trả nếu có học sinh dùng
ADD CONSTRAINT `FK_Student_Parent`
FOREIGN KEY (`parent_id`) REFERENCES `parent` (`id`) -- Học sinh thuộc phụ huynh nào
ON DELETE SET NULL ON UPDATE CASCADE; -- Cho phép 1 parent có nhiều student

-- Khóa ngoại trên bảng SCHEDULE (Lịch trình)
ALTER TABLE `Schedule`
ADD CONSTRAINT `FK_Schedule_Bus`
FOREIGN KEY (`bus_id`) REFERENCES `Bus` (`id`) -- Lịch trình sử dụng xe nào
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Schedule_Driver`
FOREIGN KEY (`driver_id`) REFERENCES `Driver` (`id`) -- Lịch trình phân công tài xế nào
ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Schedule_Route`
FOREIGN KEY (`route_id`) REFERENCES `Route` (`id`) -- Lịch trình theo tuyến nào
ON DELETE CASCADE ON UPDATE CASCADE;

-- Khóa ngoại trên bảng ROUTE_STOP (Chi tiết tuyến đường)
ALTER TABLE `Route_Stop`
ADD CONSTRAINT `FK_RouteStop_Route`
FOREIGN KEY (`route_id`) REFERENCES `Route` (`id`) -- Liên kết với tuyến đường
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_RouteStop_Location`
FOREIGN KEY (`location_id`) REFERENCES `Location` (`id`) -- Liên kết với điểm dừng
ON DELETE CASCADE ON UPDATE CASCADE;

-- Khóa ngoại trên bảng SCHEDULE_STUDENT (Chi tiết lịch trình học sinh)
ALTER TABLE `Schedule_Student`
ADD CONSTRAINT `FK_SchedStudent_Schedule`
FOREIGN KEY (`schedule_id`) REFERENCES `Schedule` (`id`) -- Liên kết với lịch trình
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_SchedStudent_Student`
FOREIGN KEY (`student_id`) REFERENCES `Student` (`id`) -- Liên kết với học sinh
ON DELETE CASCADE ON UPDATE CASCADE;

-- Khóa ngoại trên bảng LOCATIONLOG (Lịch sử vị trí)
ALTER TABLE `LocationLog`
ADD CONSTRAINT `FK_LocationLog_Bus`
FOREIGN KEY (`bus_id`) REFERENCES `Bus` (`id`) -- Ghi lại vị trí của xe nào
ON DELETE CASCADE ON UPDATE CASCADE;

-- Khóa ngoại trên bảng PARENT
ALTER TABLE `parent`
ADD CONSTRAINT `FK_Parent_User`
FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) -- Phụ huynh liên kết với tài khoản user (role PARENT)
ON DELETE CASCADE ON UPDATE CASCADE;