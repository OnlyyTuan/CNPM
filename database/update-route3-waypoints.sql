-- update-route3-waypoints.sql
-- Cập nhật waypoints cho tuyến R003 để tránh trùng với R002

-- Xóa waypoints cũ của R003
DELETE FROM route_waypoint WHERE route_id = 'R003';

-- Thêm waypoints mới cho R003 - Tuyến đi qua khu vực khác (Quận 1, 3, 10)
INSERT INTO route_waypoint (route_id, sequence, latitude, longitude, stop_name, is_stop) VALUES
('R003', 1, 10.7756, 106.6980, 'Chợ Bến Thành', TRUE),
('R003', 2, 10.7681, 106.6915, 'Đường Pasteur', FALSE),
('R003', 3, 10.7714, 106.6634, 'Cách Mạng Tháng 8', TRUE),
('R003', 4, 10.7695, 106.6565, 'Đường 3 Tháng 2', FALSE),
('R003', 5, 10.7602, 106.6371, 'Khu vực Quận 10', TRUE);

-- Kiểm tra kết quả
SELECT * FROM route_waypoint WHERE route_id = 'R003' ORDER BY sequence;
