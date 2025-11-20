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
    `email` VARCHAR(255) UNIQUE,
    `role` ENUM('admin', 'driver', 'parent') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

-- 2. BẢNG PARENT
CREATE TABLE `parent` (
    `id` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `address` VARCHAR(255),
    `user_id` VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

-- 3. BẢNG LOCATION
CREATE TABLE `location` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255),
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `type` ENUM('SCHOOL', 'PICKUP_POINT', 'PARKING') DEFAULT 'PICKUP_POINT',
    PRIMARY KEY (`id`)
);

-- 4. BẢNG DRIVER
CREATE TABLE `driver` (
    `id` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `license_number` VARCHAR(50) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `status` ENUM('DRIVING', 'OFF_DUTY', 'INACTIVE') DEFAULT 'OFF_DUTY',
    `user_id` VARCHAR(255) NOT NULL UNIQUE,
    `current_bus_id` VARCHAR(255) UNIQUE,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

-- 5. BẢNG BUS
CREATE TABLE `bus` (
    `id` VARCHAR(255) NOT NULL,
    `license_plate` VARCHAR(20) NOT NULL UNIQUE,
    `capacity` INT NOT NULL,
    `speed` DECIMAL(5, 2) DEFAULT 0,
    `status` ENUM('ACTIVE', 'MAINTENANCE', 'INACTIVE') DEFAULT 'ACTIVE',
    `driver_id` VARCHAR(255) UNIQUE,
    `current_location_id` VARCHAR(255),
    `route_id` VARCHAR(255),
    PRIMARY KEY (`id`)
);

-- 6. BẢNG ROUTE
CREATE TABLE `route` (
    `id` VARCHAR(255) NOT NULL,
    `route_name` VARCHAR(100) NOT NULL,
    `estimated_duration` INT,
    `distance` DECIMAL(10, 2),
    PRIMARY KEY (`id`)
);

-- 7. BẢNG STUDENT
CREATE TABLE `student` (
    `id` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `class` VARCHAR(50),
    `grade` VARCHAR(50),
    `parent_contact` VARCHAR(20),
    `status` ENUM('IN_BUS', 'WAITING', 'ABSENT') DEFAULT 'WAITING',
    `parent_id` VARCHAR(255) NOT NULL,
    `assigned_bus_id` VARCHAR(255),
    `pickup_location_id` VARCHAR(255),
    `dropoff_location_id` VARCHAR(255),
    PRIMARY KEY (`id`)
);

-- 8. BẢNG SCHEDULE
CREATE TABLE `schedule` (
    `id` VARCHAR(255) NOT NULL,
    `bus_id` VARCHAR(255) NOT NULL,
    `route_id` VARCHAR(255) NOT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `status` ENUM('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELED') DEFAULT 'PLANNED',
    PRIMARY KEY (`id`)
);

-- 9. BẢNG ROUTE_STOP
CREATE TABLE `route_stop` (
    `route_id` VARCHAR(255) NOT NULL,
    `location_id` VARCHAR(255) NOT NULL,
    `stop_order` INT NOT NULL,
    PRIMARY KEY (`route_id`, `location_id`)
);

-- 10. BẢNG Schedule_Student
CREATE TABLE `Schedule_Student` (
    `schedule_id` VARCHAR(255) NOT NULL,
    `student_id` VARCHAR(255) NOT NULL,
    `pickup_status` VARCHAR(50),
    PRIMARY KEY (`schedule_id`, `student_id`),
    FOREIGN KEY (`schedule_id`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `Student`(`id`) ON DELETE CASCADE
);

-- 11. BẢNG Message
CREATE TABLE `Message` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `sender_type` VARCHAR(50),
    `sender_id` VARCHAR(255),
    `recipient_id` VARCHAR(255) NOT NULL,
    `message_content` TEXT NOT NULL,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `is_read` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 12. BẢNG LocationLog
CREATE TABLE `LocationLog` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `bus_id` VARCHAR(255) NOT NULL,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `speed` DECIMAL(5, 2),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`bus_id`) REFERENCES `Bus`(`id`) ON DELETE CASCADE
);

-- ===================================
-- KHÓA NGOẠI
-- ===================================
ALTER TABLE `driver`
ADD CONSTRAINT `FK_Driver_CurrentBus`
FOREIGN KEY (`current_bus_id`) REFERENCES `bus` (`id`)
ON DELETE SET NULL ON UPDATE CASCADE;

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

ALTER TABLE `schedule`
ADD CONSTRAINT `FK_Schedule_Bus`
FOREIGN KEY (`bus_id`) REFERENCES `bus` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_Schedule_Route`
FOREIGN KEY (`route_id`) REFERENCES `route` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `route_stop`
ADD CONSTRAINT `FK_RouteStop_Route`
FOREIGN KEY (`route_id`) REFERENCES `route` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_RouteStop_Location`
FOREIGN KEY (`location_id`) REFERENCES `location` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Message`
ADD CONSTRAINT `FK_Message_Recipient`
  FOREIGN KEY (`recipient_id`) REFERENCES `user`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Message`
ADD CONSTRAINT `FK_Message_Sender`
  FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ===================================
-- DỮ LIỆU MẪU (SAMPLE DATA)
-- ===================================

-- USER (Tài khoản)
INSERT INTO `user` (`id`, `username`, `password`, `email`, `role`) VALUES
('U001', 'admin1', '123456', 'admin@school.com', 'admin'),
('U002', 'driver1', '123456', 'driver1@school.com', 'driver'),
('U003', 'driver2', '123456', 'driver2@school.com', 'driver'),
('U004', 'driver3', '123456', 'driver3@school.com', 'driver'),
('U005', 'parent1', '123456', 'parent1@gmail.com', 'parent'),
('U006', 'parent2', '123456', 'parent2@gmail.com', 'parent'),
('U007', 'parent3', '123456', 'parent3@gmail.com', 'parent'),
('U008', 'parent4', '123456', 'parent4@gmail.com', 'parent'),
('U009', 'parent5', '123456', 'parent5@gmail.com', 'parent'),
('DEFAULT_PARENT_USER', 'default_parent', '123456', 'default@parent.com', 'parent'),
('SYSTEM', 'system', 'nopass', 'system@school.com', 'admin');

-- LOCATION (Vị trí trường, bãi xe, điểm đón)
INSERT INTO `location` (`id`, `name`, `address`, `latitude`, `longitude`, `type`) VALUES
('L001', 'Trường Tiểu học A', '123 Nguyễn Trãi', 10.762622, 106.660172, 'SCHOOL'),
('L002', 'Điểm đón 1', '456 Lê Lợi', 10.763000, 106.661000, 'PICKUP_POINT'),
('L003', 'Điểm đón 2', '789 Hai Bà Trưng', 10.764000, 106.662000, 'PICKUP_POINT'),
('L004', 'Điểm đón 3', '321 Nguyễn Huệ', 10.765000, 106.663000, 'PICKUP_POINT'),
('L005', 'Bãi đỗ xe', 'Sân sau trường', 10.762800, 106.660200, 'PARKING');

-- DRIVER (Tài xế)
INSERT INTO `driver` (`id`, `full_name`, `license_number`, `phone`, `user_id`) VALUES
('D001', 'Nguyễn Văn A', 'GPLX001', '0901234567', 'U002'),
('D002', 'Trần Văn B', 'GPLX002', '0902345678', 'U003'),
('D003', 'Lê Văn C', 'GPLX003', '0903456789', 'U004');

-- PARENT (Phụ huynh)
INSERT INTO `parent` (`id`, `full_name`, `phone`, `address`, `user_id`) VALUES
('DEFAULT_PARENT', 'Chưa có phụ huynh', '0000000000', 'N/A', 'DEFAULT_PARENT_USER'),
('P001', 'Trần Thị B', '0907654321', '123 Nguyễn Trãi', 'U005'),
('P002', 'Nguyễn Văn D', '0908765432', '456 Lê Lợi', 'U006'),
('P003', 'Lê Thị E', '0909876543', '789 Hai Bà Trưng', 'U007'),
('P004', 'Phạm Văn F', '0912345678', '321 Nguyễn Huệ', 'U008'),
('P005', 'Hoàng Thị G', '0913456789', '654 Điện Biên Phủ', 'U009');

-- ROUTE (Tuyến xe)
INSERT INTO `route` (`id`, `route_name`, `estimated_duration`, `distance`) VALUES
('R001', 'Tuyến Sáng Số 1', 45, 15.5),
('R002', 'Tuyến Sáng Số 2', 50, 17.0);

-- BUS (Xe buýt)
INSERT INTO `bus` (`id`, `license_plate`, `capacity`, `speed`, `driver_id`, `current_location_id`, `route_id`) VALUES
('B001', '51A-12345', 40, 25.00, 'D001', 'L002', 'R001'),
('B002', '51A-67890', 35, 25.00, 'D002', 'L003', 'R002'),
('B003', '51A-54321', 30, 0.00, 'D003', 'L005', NULL);

-- Gán xe cho tài xế
UPDATE `driver` SET `current_bus_id` = 'B001', `status` = 'OFF_DUTY' WHERE `id` = 'D001';
UPDATE `driver` SET `current_bus_id` = 'B002', `status` = 'OFF_DUTY' WHERE `id` = 'D002';
UPDATE `driver` SET `current_bus_id` = 'B003', `status` = 'OFF_DUTY' WHERE `id` = 'D003';

-- STUDENT (Học sinh)
INSERT INTO `student` (`id`, `full_name`, `class`, `grade`, `parent_contact`, `status`, `parent_id`, `assigned_bus_id`, `pickup_location_id`, `dropoff_location_id`) VALUES
('S001', 'Nguyễn Minh An', '1A', 'Lớp 1', '0911111111', 'WAITING', 'P001', 'B001', 'L002', 'L001'),
('S002', 'Trần Thùy Dung', '3B', 'Lớp 3', '0911111111', 'WAITING', 'P001', 'B001', 'L002', 'L001'),
('S003', 'Lê Hoàng Long', '2A', 'Lớp 2', '0922222222', 'WAITING', 'P002', 'B001', 'L003', 'L001'),
('S004', 'Phạm Thị Mai', '4C', 'Lớp 4', '0933333333', 'WAITING', 'P003', 'B001', 'L004', 'L001'),
('S005', 'Bùi Quang Huy', '1B', 'Lớp 1', '0944444444', 'WAITING', 'P004', 'B002', 'L003', 'L001'),
('S006', 'Phạm Thu Hà', '2C', 'Lớp 2', '0944444444', 'WAITING', 'P004', 'B002', 'L003', 'L001'),
('S007', 'Hoàng Minh Tuấn', '3A', 'Lớp 3', '0955555555', 'WAITING', 'P005', 'B002', 'L004', 'L001');

-- ROUTE_STOP (Điểm dừng của tuyến)
INSERT INTO `route_stop` (`route_id`, `location_id`, `stop_order`) VALUES
('R001', 'L002', 1),
('R001', 'L003', 2),
('R001', 'L004', 3),
('R001', 'L001', 4),
('R002', 'L003', 1),
('R002', 'L004', 2),
('R002', 'L001', 3);

-- SCHEDULE (Lịch trình)
INSERT INTO `schedule` (`id`, `bus_id`, `route_id`, `start_time`, `end_time`) VALUES
('SCH001', 'B001', 'R001', '2025-10-20 06:30:00', '2025-10-20 07:15:00'),
('SCH002', 'B002', 'R002', '2025-10-20 06:45:00', '2025-10-20 07:30:00'),
('SCH003', 'B001', 'R001', '2025-10-21 06:30:00', '2025-10-21 07:15:00');

-- SCHEDULE_STUDENT (Trạng thái đón học sinh theo lịch)
INSERT INTO `schedule_student` (`schedule_id`, `student_id`, `pickup_status`) VALUES
('SCH001', 'S001', 'PICKED_UP'),
('SCH001', 'S002', 'PICKED_UP'),
('SCH001', 'S003', 'MISSED'),
('SCH002', 'S004', 'PICKED_UP'),
('SCH002', 'S005', 'PICKED_UP'),
('SCH002', 'S006', 'PICKED_UP'),
('SCH002', 'S007', 'PENDING');

-- MESSAGE (Tin nhắn)
INSERT INTO `message` (`sender_type`, `sender_id`, `recipient_id`, `message_content`, `timestamp`, `is_read`) VALUES
('DRIVER', 'U002', 'U005', 'Xe sẽ đến điểm đón trong 5 phút.', '2025-10-20 06:40:00', TRUE),
('PARENT', 'U005', 'U002', 'Con em hôm nay nghỉ học.', '2025-10-20 06:30:00', TRUE),
('SYSTEM', 'SYSTEM', 'U006', 'Xe buýt BUS001 đã đến điểm đón.', '2025-10-20 06:45:00', TRUE),
('DRIVER', 'U003', 'U008', 'Con bạn đã lên xe an toàn.', '2025-10-20 06:50:00', FALSE),
('SYSTEM', 'SYSTEM', 'U009', 'Xe buýt BUS002 sẽ đến trong 10 phút.', '2025-10-20 06:55:00', FALSE);


-- LOCATION LOG (Lịch sử vị trí xe)
INSERT INTO `locationlog` (`bus_id`, `timestamp`, `latitude`, `longitude`, `speed`) VALUES
('B001', '2025-10-20 06:45:00', 10.763000, 106.661000, 25.50),
('B001', '2025-10-20 06:50:00', 10.764000, 106.662000, 28.30),
('B001', '2025-10-20 06:55:00', 10.765000, 106.663000, 30.00),
('B001', '2025-10-20 07:00:00', 10.762800, 106.660200, 0.00),
('B002', '2025-10-20 06:50:00', 10.764000, 106.662000, 26.50),
('B002', '2025-10-20 06:55:00', 10.765000, 106.663000, 29.00),
('B002', '2025-10-20 07:00:00', 10.762800, 106.660200, 0.00);