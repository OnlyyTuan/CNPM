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

-- ===================================
-- DỮ LIỆU MẪU (SAMPLE DATA)
-- ===================================

-- Thêm dữ liệu vào bảng USER
-- Mật khẩu mẫu: "password123" (trong thực tế cần hash, ở đây dùng plaintext cho demo)
INSERT INTO `user` (`id`, `username`, `password`, `email`, `role`) VALUES
('USER001', 'admin', '$2b$10$8JqH.ZxHZ9qZ3Z3Z3Z3Z3.ZxHZ9qZ3Z3Z3Z3Z3ZxHZ9qZ3Z3Z3Z3Z', 'admin@schoolbus.com', 'ADMIN'),
('USER002', 'driver1', '$2b$10$8JqH.ZxHZ9qZ3Z3Z3Z3Z3.ZxHZ9qZ3Z3Z3Z3Z3ZxHZ9qZ3Z3Z3Z3Z', 'driver1@schoolbus.com', 'DRIVER'),
('USER003', 'driver2', '$2b$10$8JqH.ZxHZ9qZ3Z3Z3Z3Z3.ZxHZ9qZ3Z3Z3Z3Z3ZxHZ9qZ3Z3Z3Z3Z', 'driver2@schoolbus.com', 'DRIVER'),
('USER004', 'driver3', '$2b$10$8JqH.ZxHZ9qZ3Z3Z3Z3Z3.ZxHZ9qZ3Z3Z3Z3Z3ZxHZ9qZ3Z3Z3Z3Z', 'driver3@schoolbus.com', 'DRIVER'),
('USER005', 'parent1', '$2b$10$8JqH.ZxHZ9qZ3Z3Z3Z3Z3.ZxHZ9qZ3Z3Z3Z3Z3ZxHZ9qZ3Z3Z3Z3Z', 'nguyenvana@gmail.com', 'PARENT'),
('USER006', 'parent2', '$2b$10$8JqH.ZxHZ9qZ3Z3Z3Z3Z3.ZxHZ9qZ3Z3Z3Z3Z3ZxHZ9qZ3Z3Z3Z3Z', 'tranthib@gmail.com', 'PARENT'),
('USER007', 'parent3', '$2b$10$8JqH.ZxHZ9qZ3Z3Z3Z3Z3.ZxHZ9qZ3Z3Z3Z3Z3ZxHZ9qZ3Z3Z3Z3Z', 'lethic@gmail.com', 'PARENT'),
('USER008', 'parent4', '$2b$10$8JqH.ZxHZ9qZ3Z3Z3Z3Z3.ZxHZ9qZ3Z3Z3Z3Z3ZxHZ9qZ3Z3Z3Z3Z', 'phamvand@gmail.com', 'PARENT'),
('USER009', 'parent5', '$2b$10$8JqH.ZxHZ9qZ3Z3Z3Z3Z3.ZxHZ9qZ3Z3Z3Z3Z3ZxHZ9qZ3Z3Z3Z3Z', 'hoangthie@gmail.com', 'PARENT');

-- Thêm dữ liệu vào bảng LOCATION
INSERT INTO `Location` (`id`, `name`, `address`, `latitude`, `longitude`, `type`, `estimatedTime`) VALUES
('LOC001', 'Trường Tiểu Học ABC', '123 Đường Lê Lợi, Quận 1, TP.HCM', 10.77297000, 106.69790000, 'SCHOOL', '08:00:00'),
('LOC002', 'Điểm đón Nguyễn Văn A', '45 Đường Nguyễn Huệ, Quận 1, TP.HCM', 10.77463000, 106.70127000, 'PICKUP_POINT', '06:45:00'),
('LOC003', 'Điểm đón Trần Thị B', '78 Đường Lê Thánh Tôn, Quận 1, TP.HCM', 10.77589000, 106.70234000, 'PICKUP_POINT', '06:50:00'),
('LOC004', 'Điểm đón Lê Thị C', '12 Đường Pasteur, Quận 3, TP.HCM', 10.77832000, 106.69345000, 'PICKUP_POINT', '06:55:00'),
('LOC005', 'Điểm đón Phạm Văn D', '56 Đường Hai Bà Trưng, Quận 3, TP.HCM', 10.78124000, 106.69521000, 'PICKUP_POINT', '07:00:00'),
('LOC006', 'Điểm đón Hoàng Thị E', '89 Đường Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM', 10.78345000, 106.69678000, 'PICKUP_POINT', '07:05:00'),
('LOC007', 'Điểm đón Vũ Văn F', '23 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 10.79234000, 106.70456000, 'PICKUP_POINT', '07:10:00'),
('LOC008', 'Điểm đón Đặng Thị G', '67 Đường Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM', 10.79567000, 106.70789000, 'PICKUP_POINT', '07:15:00'),
('LOC009', 'Điểm đón Bùi Văn H', '34 Đường Nguyễn Đình Chiểu, Quận 3, TP.HCM', 10.78012000, 106.69234000, 'PICKUP_POINT', '07:20:00'),
('LOC010', 'Bãi đỗ xe trường', '123 Đường Lê Lợi (Sân sau), Quận 1, TP.HCM', 10.77289000, 106.69782000, 'PARKING', '08:30:00');

-- Thêm dữ liệu vào bảng DRIVER
INSERT INTO `Driver` (`id`, `name`, `phone`, `licenseNumber`, `experience`, `status`, `currentBus_id`) VALUES
('DRV001', 'Nguyễn Văn Tài', '0901234567', 'B2-123456', 10, 'OFF_DUTY', NULL),
('DRV002', 'Trần Minh Tuấn', '0902345678', 'B2-234567', 8, 'OFF_DUTY', NULL),
('DRV003', 'Lê Hoàng Nam', '0903456789', 'B2-345678', 12, 'OFF_DUTY', NULL);

-- Thêm dữ liệu vào bảng ROUTE
INSERT INTO `Route` (`id`, `name`, `estimatedDuration`, `distance`, `startTime`, `endTime`) VALUES
('ROUTE001', 'Tuyến A - Buổi sáng', 60, 15.5, '06:45:00', '08:00:00'),
('ROUTE002', 'Tuyến B - Buổi sáng', 55, 12.3, '06:50:00', '08:00:00'),
('ROUTE003', 'Tuyến C - Buổi sáng', 50, 10.8, '07:00:00', '08:00:00');

-- Thêm dữ liệu vào bảng BUS
INSERT INTO `Bus` (`id`, `capacity`, `currentLocation_id`, `status`, `speed`, `lastUpdate`, `route_id`, `driver_id`) VALUES
('BUS001', 35, 'LOC010', 'ACTIVE', 0.00, '2025-10-20 08:30:00', 'ROUTE001', 'DRV001'),
('BUS002', 40, 'LOC010', 'ACTIVE', 0.00, '2025-10-20 08:30:00', 'ROUTE002', 'DRV002'),
('BUS003', 30, 'LOC010', 'MAINTENANCE', 0.00, '2025-10-20 08:30:00', NULL, NULL);

-- Cập nhật currentBus_id cho Driver
UPDATE `Driver` SET `currentBus_id` = 'BUS001' WHERE `id` = 'DRV001';
UPDATE `Driver` SET `currentBus_id` = 'BUS002' WHERE `id` = 'DRV002';

-- Thêm dữ liệu vào bảng ROUTE_STOP
INSERT INTO `Route_Stop` (`route_id`, `location_id`, `stop_order`) VALUES
('ROUTE001', 'LOC002', 1),
('ROUTE001', 'LOC003', 2),
('ROUTE001', 'LOC004', 3),
('ROUTE001', 'LOC001', 4),
('ROUTE002', 'LOC005', 1),
('ROUTE002', 'LOC006', 2),
('ROUTE002', 'LOC007', 3),
('ROUTE002', 'LOC001', 4),
('ROUTE003', 'LOC008', 1),
('ROUTE003', 'LOC009', 2),
('ROUTE003', 'LOC001', 3);

-- Thêm dữ liệu vào bảng PARENT
INSERT INTO `parent` (`id`, `name`, `phone`, `address`, `user_id`) VALUES
('PAR001', 'Nguyễn Văn A', '0911111111', '45 Đường Nguyễn Huệ, Quận 1, TP.HCM', 'USER005'),
('PAR002', 'Trần Thị B', '0922222222', '78 Đường Lê Thánh Tôn, Quận 1, TP.HCM', 'USER006'),
('PAR003', 'Lê Thị C', '0933333333', '12 Đường Pasteur, Quận 3, TP.HCM', 'USER007'),
('PAR004', 'Phạm Văn D', '0944444444', '56 Đường Hai Bà Trưng, Quận 3, TP.HCM', 'USER008'),
('PAR005', 'Hoàng Thị E', '0955555555', '89 Đường Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM', 'USER009');

-- Thêm dữ liệu vào bảng STUDENT
INSERT INTO `Student` (`id`, `name`, `class`, `grade`, `parentContact`, `status`, `assignedBus_id`, `pickupLocation_id`, `dropoffLocation_id`, `parent_id`) VALUES
('STU001', 'Nguyễn Minh An', '1A', 1, '0911111111', 'AT_HOME', 'BUS001', 'LOC002', 'LOC001', 'PAR001'),
('STU002', 'Nguyễn Thùy Dung', '3B', 3, '0911111111', 'AT_HOME', 'BUS001', 'LOC002', 'LOC001', 'PAR001'),
('STU003', 'Trần Hoàng Long', '2A', 2, '0922222222', 'AT_HOME', 'BUS001', 'LOC003', 'LOC001', 'PAR002'),
('STU004', 'Lê Thị Mai', '4C', 4, '0933333333', 'AT_HOME', 'BUS001', 'LOC004', 'LOC001', 'PAR003'),
('STU005', 'Phạm Quang Huy', '1B', 1, '0944444444', 'AT_HOME', 'BUS002', 'LOC005', 'LOC001', 'PAR004'),
('STU006', 'Phạm Thu Hà', '2C', 2, '0944444444', 'AT_HOME', 'BUS002', 'LOC005', 'LOC001', 'PAR004'),
('STU007', 'Hoàng Minh Tuấn', '3A', 3, '0955555555', 'AT_HOME', 'BUS002', 'LOC006', 'LOC001', 'PAR005'),
('STU008', 'Vũ Thị Lan', '5A', 5, '0966666666', 'AT_HOME', 'BUS002', 'LOC007', 'LOC001', NULL),
('STU009', 'Đặng Văn Phong', '4B', 4, '0977777777', 'AT_HOME', NULL, 'LOC008', 'LOC001', NULL),
('STU010', 'Bùi Thị Hồng', '1C', 1, '0988888888', 'AT_HOME', NULL, 'LOC009', 'LOC001', NULL);

-- Thêm dữ liệu vào bảng SCHEDULE
INSERT INTO `Schedule` (`id`, `date`, `time`, `status`, `bus_id`, `driver_id`, `route_id`) VALUES
('SCH001', '2025-10-20', '06:45:00', 'COMPLETED', 'BUS001', 'DRV001', 'ROUTE001'),
('SCH002', '2025-10-20', '06:50:00', 'COMPLETED', 'BUS002', 'DRV002', 'ROUTE002'),
('SCH003', '2025-10-21', '06:45:00', 'PLANNED', 'BUS001', 'DRV001', 'ROUTE001'),
('SCH004', '2025-10-21', '06:50:00', 'PLANNED', 'BUS002', 'DRV002', 'ROUTE002'),
('SCH005', '2025-10-22', '06:45:00', 'PLANNED', 'BUS001', 'DRV001', 'ROUTE001'),
('SCH006', '2025-10-22', '06:50:00', 'PLANNED', 'BUS002', 'DRV002', 'ROUTE002');

-- Thêm dữ liệu vào bảng SCHEDULE_STUDENT
INSERT INTO `Schedule_Student` (`schedule_id`, `student_id`, `pickup_status`) VALUES
('SCH001', 'STU001', 'PICKED_UP'),
('SCH001', 'STU002', 'PICKED_UP'),
('SCH001', 'STU003', 'PICKED_UP'),
('SCH001', 'STU004', 'PICKED_UP'),
('SCH002', 'STU005', 'PICKED_UP'),
('SCH002', 'STU006', 'PICKED_UP'),
('SCH002', 'STU007', 'PICKED_UP'),
('SCH002', 'STU008', 'MISSED'),
('SCH003', 'STU001', 'PENDING'),
('SCH003', 'STU002', 'PENDING'),
('SCH003', 'STU003', 'PENDING'),
('SCH003', 'STU004', 'PENDING'),
('SCH004', 'STU005', 'PENDING'),
('SCH004', 'STU006', 'PENDING'),
('SCH004', 'STU007', 'PENDING'),
('SCH004', 'STU008', 'PENDING');

-- Thêm dữ liệu vào bảng MESSAGE
INSERT INTO `Message` (`sender_type`, `sender_id`, `recipient_id`, `message_content`, `timestamp`, `is_read`) VALUES
('DRIVER', 'DRV001', 'PAR001', 'Xe sẽ đến điểm đón trong 5 phút.', '2025-10-20 06:40:00', TRUE),
('PARENT', 'PAR001', 'DRV001', 'Con em hôm nay nghỉ ốm, không đi xe buýt.', '2025-10-20 06:30:00', TRUE),
('SYSTEM', 'SYSTEM', 'PAR002', 'Xe buýt BUS001 đã đến điểm đón của con bạn.', '2025-10-20 06:45:00', TRUE),
('DRIVER', 'DRV002', 'PAR004', 'Con bạn đã lên xe an toàn.', '2025-10-20 06:50:00', FALSE),
('SYSTEM', 'SYSTEM', 'PAR005', 'Xe buýt BUS002 sẽ đến trong 10 phút.', '2025-10-20 06:55:00', FALSE);

-- Thêm dữ liệu vào bảng LOCATIONLOG
INSERT INTO `LocationLog` (`bus_id`, `timestamp`, `latitude`, `longitude`, `speed`) VALUES
('BUS001', '2025-10-20 06:45:00', 10.77463000, 106.70127000, 25.50),
('BUS001', '2025-10-20 06:50:00', 10.77589000, 106.70234000, 28.30),
('BUS001', '2025-10-20 06:55:00', 10.77832000, 106.69345000, 30.00),
('BUS001', '2025-10-20 07:00:00', 10.78124000, 106.69521000, 27.80),
('BUS001', '2025-10-20 07:30:00', 10.77297000, 106.69790000, 0.00),
('BUS002', '2025-10-20 06:50:00', 10.78124000, 106.69521000, 26.50),
('BUS002', '2025-10-20 06:55:00', 10.78345000, 106.69678000, 29.00),
('BUS002', '2025-10-20 07:00:00', 10.79234000, 106.70456000, 31.20),
('BUS002', '2025-10-20 07:05:00', 10.79567000, 106.70789000, 28.50),
('BUS002', '2025-10-20 07:35:00', 10.77297000, 106.69790000, 0.00);