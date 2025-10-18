-- ===================================
-- BẢNG THỰC THỂ (ENTITIES)
-- ===================================
CREATE DATABASE IF NOT EXISTS smartschoolbus;
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
    `grade` INT,                -- Khối học
    `parentContact` VARCHAR(50),-- Số điện thoại/email liên hệ của phụ huynh
    `status` VARCHAR(50),       -- Trạng thái (ví dụ: WAITING, PICKED_UP, ABSENT)
    `assignedBus_id` VARCHAR(255), -- Mã xe buýt được chỉ định (Khóa ngoại tham chiếu đến Bus)
    `pickupLocation_id` VARCHAR(255), -- Mã điểm đón (Khóa ngoại tham chiếu đến Location)
    `dropoffLocation_id` VARCHAR(255),-- Mã điểm trả (Khóa ngoại tham chiếu đến Location)
    PRIMARY KEY (`id`)          -- Định nghĩa Khóa chính
);

-- ===================================
-- BẢNG QUẢN LÝ VÀ LIÊN KẾT
-- ===================================

CREATE TABLE `Schedule` (
    `id` VARCHAR(255) NOT NULL, -- Mã lịch trình (Khóa chính)
    `date` DATE,                -- Ngày chạy lịch trình
    `time` TIME,                -- Giờ chạy lịch trình
    `status` VARCHAR(50),       -- Trạng thái lịch trình (ví dụ: SCHEDULED, ACTIVE, COMPLETED)
    `bus_id` VARCHAR(255) NOT NULL, -- Mã xe sử dụng (Khóa ngoại)
    `driver_id` VARCHAR(255) NOT NULL, -- Mã tài xế được giao (Khóa ngoại)
    `route_id` VARCHAR(255) NOT NULL, -- Mã tuyến đường theo (Khóa ngoại)
    PRIMARY KEY (`id`)          -- Định nghĩa Khóa chính
);

-- Bảng liên kết chi tiết tuyến đường (Mối quan hệ n:m giữa Route và Location)
CREATE TABLE `Route_Stop` (
    `route_id` VARCHAR(255) NOT NULL, -- Mã tuyến đường (Thành phần Khóa chính & Khóa ngoại)
    `location_id` VARCHAR(255) NOT NULL, -- Mã điểm dừng (Thành phần Khóa chính & Khóa ngoại)
    `stop_order` INT NOT NULL,  -- Thứ tự điểm dừng trên tuyến
    PRIMARY KEY (`route_id`, `location_id`) -- Khóa chính kép
);

-- Bảng liên kết chi tiết lịch trình học sinh (Mối quan hệ n:m giữa Schedule và Student)
CREATE TABLE `Schedule_Student` (
    `schedule_id` VARCHAR(255) NOT NULL, -- Mã lịch trình (Thành phần Khóa chính & Khóa ngoại)
    `student_id` VARCHAR(255) NOT NULL, -- Mã học sinh (Thành phần Khóa chính & Khóa ngoại)
    `pickup_status` VARCHAR(50), -- Tình trạng đón (ví dụ: ON_BUS, MISSED, ABSENT)
    PRIMARY KEY (`schedule_id`, `student_id`) -- Khóa chính kép
);

-- Bảng ghi lại lịch sử vị trí (Theo dõi GPS)
CREATE TABLE `LocationLog` (
    `id` INT AUTO_INCREMENT NOT NULL, -- Mã theo dõi (Khóa chính tự tăng)
    `bus_id` VARCHAR(255) NOT NULL, -- Mã xe được theo dõi (Khóa ngoại)
    `timestamp` TIMESTAMP NOT NULL, -- Thời gian ghi nhận
    `latitude` DECIMAL(10, 8),      -- Vĩ độ tại thời điểm đó
    `longitude` DECIMAL(11, 8),     -- Kinh độ tại thời điểm đó
    `speed` DECIMAL(5, 2),          -- Vận tốc tại thời điểm đó
    PRIMARY KEY (`id`)              -- Định nghĩa Khóa chính
);

-- Bảng tin nhắn/thông báo
CREATE TABLE `Message` (
    `id` INT AUTO_INCREMENT NOT NULL, -- Mã tin nhắn (Khóa chính tự tăng)
    `sender_type` VARCHAR(50),      -- Loại người gửi (ví dụ: 'SYSTEM', 'DRIVER')
    `sender_id` VARCHAR(255),       -- Mã định danh người gửi
    `recipient_id` VARCHAR(255) NOT NULL, -- Mã định danh người nhận (ví dụ: ID học sinh/phụ huynh)
    `message_content` TEXT NOT NULL, -- Nội dung tin nhắn
    `timestamp` TIMESTAMP NOT NULL, -- Thời gian gửi
    `is_read` TINYINT(1) DEFAULT 0, -- Trạng thái đọc (0: Chưa đọc, 1: Đã đọc)
    PRIMARY KEY (`id`)              -- Định nghĩa Khóa chính
);

-- ===================================
-- ĐỊNH NGHĨA KHÓA NGOẠI (FOREIGN KEYS)
-- ===================================
-- Thiết lập mối quan hệ giữa các bảng

-- Khóa ngoại trên bảng DRIVER
ALTER TABLE `Driver`
ADD CONSTRAINT `FK_Driver_Bus`
FOREIGN KEY (`currentBus_id`) REFERENCES `Bus` (`id`) -- Tài xế đang lái xe nào
ON DELETE SET NULL ON UPDATE CASCADE; -- Nếu xe bị xóa, trường này sẽ là NULL

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
ON DELETE RESTRICT ON UPDATE CASCADE; -- Không cho phép xóa điểm trả nếu có học sinh dùng

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