-- Delete old data and insert with correct UTF-8
DELETE FROM location;

INSERT INTO location (id, name, address, latitude, longitude, type) VALUES
('L001', 'Trường Tiểu học Nguyễn Du', '123 Nguyễn Trãi, Q1', 10.762622, 106.660172, 'SCHOOL'),
('L002', 'Điểm đón Lê Lợi', '456 Lê Lợi, Q1', 10.763000, 106.661000, 'PICKUP_POINT'),
('L003', 'Điểm đón Hai Bà Trưng', '789 Hai Bà Trưng, Q3', 10.764000, 106.662000, 'PICKUP_POINT'),
('L004', 'Điểm đón Nguyễn Huệ', '321 Nguyễn Huệ, Q1', 10.765000, 106.663000, 'PICKUP_POINT'),
('L005', 'Bãi đỗ xe trường', 'Sân sau trường', 10.762800, 106.660200, 'PARKING'),
('L006', 'Điểm đón Cách Mạng Tháng 8', '100 Cách Mạng Tháng 8, Q3', 10.768000, 106.665000, 'PICKUP_POINT'),
('L007', 'Điểm đón Điện Biên Phủ', '200 Điện Biên Phủ, Q3', 10.770000, 106.667000, 'PICKUP_POINT'),
('L008', 'Điểm trả Pasteur', '50 Pasteur, Q1', 10.763500, 106.661500, 'PICKUP_POINT'),
('L009', 'Điểm trả Lý Tự Trọng', '80 Lý Tự Trọng, Q1', 10.764500, 106.662500, 'PICKUP_POINT'),
('L010', 'Điểm trả Nam Kỳ Khởi Nghĩa', '120 Nam Kỳ Khởi Nghĩa, Q1', 10.765500, 106.663500, 'PICKUP_POINT');

-- Fix route names
UPDATE route SET route_name = 'Tuyến Sáng Số 1' WHERE id = 'R001';
UPDATE route SET route_name = 'Tuyến Sáng Số 2' WHERE id = 'R002';
