-- Thêm bảng route_waypoints để lưu các điểm trên lộ trình
-- Mỗi route có nhiều waypoints theo thứ tự

-- Bỏ bảng cũ nếu tồn tại
DROP TABLE IF EXISTS route_waypoint;

-- Tạo bảng mới
CREATE TABLE route_waypoint (
    id VARCHAR(255) PRIMARY KEY,
    route_id VARCHAR(255) NOT NULL,
    sequence INT NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    stop_name VARCHAR(255),
    is_stop BOOLEAN DEFAULT FALSE,
    INDEX idx_route (route_id),
    INDEX idx_sequence (route_id, sequence)
);

-- Thêm dữ liệu mẫu cho Route R001 (giả sử từ Bến xe Miền Đông đến Đại học Quốc Gia)
INSERT INTO route_waypoint (id, route_id, sequence, latitude, longitude, stop_name, is_stop) VALUES
-- Điểm xuất phát
('WP001', 'R001', 0, 10.815010, 106.702700, 'Bến xe Miền Đông', TRUE),
-- Điểm trung gian
('WP002', 'R001', 1, 10.810500, 106.697800, NULL, FALSE),
('WP003', 'R001', 2, 10.805200, 106.692500, 'Ngã tư Thủ Đức', TRUE),
('WP004', 'R001', 3, 10.798000, 106.687000, NULL, FALSE),
('WP005', 'R001', 4, 10.790000, 106.680000, 'Đại học Bách Khoa', TRUE),
('WP006', 'R001', 5, 10.780000, 106.672000, NULL, FALSE),
-- Điểm đến
('WP007', 'R001', 6, 10.772800, 106.665500, 'Đại học Quốc Gia', TRUE);

-- Thêm dữ liệu cho Route R002 (tuyến khác)
INSERT INTO route_waypoint (id, route_id, sequence, latitude, longitude, stop_name, is_stop) VALUES
('WP010', 'R002', 0, 10.762622, 106.660172, 'Trung tâm Q1', TRUE),
('WP011', 'R002', 1, 10.765000, 106.665000, NULL, FALSE),
('WP012', 'R002', 2, 10.770000, 106.670000, 'Chợ Bến Thành', TRUE),
('WP013', 'R002', 3, 10.775000, 106.672000, NULL, FALSE),
('WP014', 'R002', 4, 10.780000, 106.675000, 'Nhà hát thành phố', TRUE);
