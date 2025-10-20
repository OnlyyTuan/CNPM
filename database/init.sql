-- ===================================
-- KHỞI TẠO CƠ SỞ DỮ LIỆU
-- ===================================
DROP DATABASE IF EXISTS smartschoolbus;
CREATE DATABASE smartschoolbus;
USE smartschoolbus;

-- ===================================
-- 1. BẢNG USER (Bảng gốc - Phải tạo TRƯỚC)
-- ===================================
CREATE TABLE `user` (
    `id` VARCHAR(255) NOT NULL,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE, -- Thêm email cho login
    `role` ENUM('admin', 'driver', 'parent') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

-- ===================================
-- 2. BẢNG PARENT (Tham chiếu user)
-- ===================================
CREATE TABLE `parent` (
    `id` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `address` VARCHAR(255),
    `user_id` VARCHAR(255) NOT NULL UNIQUE, -- KHÓA NGOẠI: Phải là VARCHAR(255)
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

-- ===================================
-- 3. BẢNG LOCATION
-- ===================================
CREATE TABLE `location` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255),
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `type` ENUM('SCHOOL', 'PICKUP_POINT', 'PARKING') DEFAULT 'PICKUP_POINT',
    PRIMARY KEY (`id`)
);

-- ===================================
-- 4. BẢNG DRIVER (Tham chiếu user, Bus. driver_id được thêm sau)
-- ===================================
CREATE TABLE `driver` (
    `id` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `license_number` VARCHAR(50) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `status` ENUM('DRIVING', 'OFF_DUTY', 'INACTIVE') DEFAULT 'OFF_DUTY',
    `user_id` VARCHAR(255) NOT NULL UNIQUE, -- KHÓA NGOẠI: Phải là VARCHAR(255)
    `current_bus_id` VARCHAR(255) UNIQUE,   -- MỚI THÊM: Hỗ trợ 1-1 (driver biết đang lái xe nào)
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
    -- Khóa ngoại current_bus_id sẽ được thêm ở phần cuối
);

-- ===================================
-- 5. BẢNG BUS (Tham chiếu Location, Route, Driver)
-- ===================================
CREATE TABLE `bus` (
    `id` VARCHAR(255) NOT NULL,
    `license_plate` VARCHAR(20) NOT NULL UNIQUE,
    `capacity` INT NOT NULL,
    `speed` DECIMAL(5, 2) DEFAULT 0,
    `status` ENUM('ACTIVE', 'MAINTENANCE', 'INACTIVE') DEFAULT 'ACTIVE',
    `driver_id` VARCHAR(255) UNIQUE, -- Khóa ngoại trỏ đến Driver.id
    `current_location_id` VARCHAR(255), -- Khóa ngoại trỏ đến Location.id
    `route_id` VARCHAR(255), -- Khóa ngoại trỏ đến Route.id
    PRIMARY KEY (`id`)
    -- Khóa ngoại sẽ được thêm ở phần cuối
);

-- ===================================
-- 6. BẢNG ROUTE (Tham chiếu Location)
-- ===================================
CREATE TABLE `route` (
    `id` VARCHAR(255) NOT NULL,
    `route_name` VARCHAR(100) NOT NULL,
    `estimated_duration` INT, -- Thời gian ước tính (phút)
    `distance` DECIMAL(10, 2), -- Quãng đường (km)
    PRIMARY KEY (`id`)
);

-- ===================================
-- 7. BẢNG STUDENT (Tham chiếu Parent, Bus, Location)
-- ===================================
-- backend/src/db.js (Sửa lại CREATE TABLE student)
CREATE TABLE `student` (
    `id` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,    -- Tên cột trong SQL
    `class` VARCHAR(50),                  -- Cột bị thiếu: Tên lớp (cho className)
    `grade` VARCHAR(50),
    `parent_contact` VARCHAR(20),         -- Cột bị thiếu: Số liên lạc (cho parentContact)
    `status` ENUM('IN_BUS', 'WAITING', 'ABSENT') DEFAULT 'WAITING', -- Cột bị thiếu
    `parent_id` VARCHAR(255) NOT NULL,    -- FK: Phụ huynh quản lý
    `assigned_bus_id` VARCHAR(255),       -- FK: Xe được phân công
    `pickup_location_id` VARCHAR(255),    -- FK: Điểm đón
    `dropoff_location_id` VARCHAR(255),   -- FK: Điểm trả (thường là trường học)
    PRIMARY KEY (`id`)
    -- Ràng buộc Khóa ngoại sẽ được thêm sau
);
-- 8. BẢNG SCHEDULE
-- ===================================
CREATE TABLE `schedule` (
    `id` VARCHAR(255) NOT NULL,
    `bus_id` VARCHAR(255) NOT NULL,
    `route_id` VARCHAR(255) NOT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `status` ENUM('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELED') DEFAULT 'PLANNED',
    PRIMARY KEY (`id`)
    -- Khóa ngoại sẽ được thêm ở phần cuối
);

-- ===================================
-- 9. BẢNG Route_Stop (N-N giữa Route và Location)
-- ===================================
CREATE TABLE `route_stop` (
    `route_id` VARCHAR(255) NOT NULL,
    `location_id` VARCHAR(255) NOT NULL,
    `stop_order` INT NOT NULL,
    PRIMARY KEY (`route_id`, `location_id`)
    -- Khóa ngoại sẽ được thêm ở phần cuối
);


-- ===================================
-- KHÓA NGOẠI (FOREIGN KEYS) - Sau khi tất cả các bảng đã được tạo
-- ===================================

-- Khóa ngoại cho bảng DRIVER (FK_Driver_Bus)
ALTER TABLE `driver`
ADD CONSTRAINT `FK_Driver_CurrentBus`
FOREIGN KEY (`current_bus_id`) REFERENCES `bus` (`id`)
ON DELETE SET NULL ON UPDATE CASCADE;

-- Khóa ngoại cho bảng BUS
ALTER TABLE `bus`
ADD CONSTRAINT `FK_Bus_Driver`
FOREIGN KEY (`driver_id`) REFERENCES `driver` (`id`)
ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Bus_Location`
FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`)
ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Bus_Route`
FOREIGN KEY (`route_id`) REFERENCES `route` (`id`)
ON DELETE SET NULL ON UPDATE CASCADE;

-- Khóa ngoại cho bảng STUDENT
ALTER TABLE `student`
ADD CONSTRAINT `FK_Student_Parent`
FOREIGN KEY (`parent_id`) REFERENCES `parent` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Student_Bus`
FOREIGN KEY (`assigned_bus_id`) REFERENCES `bus` (`id`)
ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Student_Pickup`
FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`)
ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Student_Dropoff`
FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Khóa ngoại cho bảng SCHEDULE
ALTER TABLE `schedule`
ADD CONSTRAINT `FK_Schedule_Bus`
FOREIGN KEY (`bus_id`) REFERENCES `bus` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Schedule_Route`
FOREIGN KEY (`route_id`) REFERENCES `route` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Khóa ngoại cho bảng ROUTE_STOP
ALTER TABLE `route_stop`
ADD CONSTRAINT `FK_RouteStop_Route`
FOREIGN KEY (`route_id`) REFERENCES `route` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_RouteStop_Location`
FOREIGN KEY (`location_id`) REFERENCES `location` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE;


-- ===================================
-- DỮ LIỆU MẪU (SAMPLE DATA)
-- ===================================
-- Mật khẩu mẫu: 123456 (Sử dụng plaintext cho mục đích demo/khởi tạo)
INSERT INTO `user` (`id`, `username`, `password`, `email`, `role`) VALUES
('U001', 'admin1', '123456', 'admin@school.com', 'admin'),
('U002', 'driver1', '123456', 'driver1@school.com', 'driver'),
('U003', 'parent1', '123456', 'parent1@gmail.com', 'parent');

INSERT INTO `location` (`id`, `name`, `address`, `latitude`, `longitude`, `type`) VALUES
('L001', 'Trường Tiểu học A', '123 Nguyễn Trãi', 10.762622, 106.660172, 'SCHOOL'),
('L002', 'Điểm đón 1', '456 Lê Lợi', 10.763000, 106.661000, 'PICKUP_POINT');

INSERT INTO `driver` (`id`, `full_name`, `license_number`, `phone`, `user_id`) VALUES
('D001', 'Nguyen Van A', 'GPLX1234', '0901234567', 'U002');

INSERT INTO `parent` (`id`, `full_name`, `phone`, `address`, `user_id`) VALUES
('P001', 'Tran Thi B', '0907654321', '123 Nguyễn Trãi', 'U003');

INSERT INTO `route` (`id`, `route_name`, `estimated_duration`, `distance`) VALUES
('R001', 'Tuyến Sáng Số 1', 45, 15.5);

INSERT INTO `bus` (`id`, `license_plate`, `capacity`,`speed`, `driver_id`, `current_location_id`, `route_id`) VALUES
-- Gán BUS001 cho DRIVER001 ngay từ đầu
('B001', '51A-12345', 40,25.00, 'D001', 'L002', 'R001');

-- Cập nhật driver để nó biết đang lái xe nào (hoàn thiện mối quan hệ 1-1)
UPDATE `driver` SET `current_bus_id` = 'B001', `status` = 'OFF_DUTY' WHERE `id` = 'D001';


INSERT INTO `student` (`id`, `full_name`, `class`, `grade`, `parent_contact`, `status`, `parent_id`, `assigned_bus_id`, `pickup_location_id`, `dropoff_location_id`) VALUES
-- Thêm giá trị cho 'class', 'parent_contact', và 'status'
('S001', 'Lê Văn C', '5A', 'Lớp 5', '0987654321', 'WAITING', 'P001', 'B001', 'L002', 'L001');

INSERT INTO `schedule` (`id`, `bus_id`, `route_id`, `start_time`, `end_time`) VALUES
('SCH001', 'B001', 'R001', '2025-10-20 06:30:00', '2025-10-20 07:15:00');

INSERT INTO `route_stop` (`route_id`, `location_id`, `stop_order`) VALUES
('R001', 'L002', 1), -- Điểm đón
('R001', 'L001', 2); -- Trường học