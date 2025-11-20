-- Fix encoding for Location table
UPDATE location SET 
    name = 'Trường Tiểu học Nguyễn Du',
    address = '123 Nguyễn Trãi, Q1'
WHERE id = 'L001';

UPDATE location SET 
    name = 'Điểm đón Lê Lợi',
    address = '456 Lê Lợi, Q1'
WHERE id = 'L002';

UPDATE location SET 
    name = 'Điểm đón Hai Bà Trưng',
    address = '789 Hai Bà Trưng, Q3'
WHERE id = 'L003';

UPDATE location SET 
    name = 'Điểm đón Nguyễn Huệ',
    address = '321 Nguyễn Huệ, Q1'
WHERE id = 'L004';

UPDATE location SET 
    name = 'Bãi đỗ xe trường',
    address = 'Sân sau trường'
WHERE id = 'L005';

-- Fix encoding for Route table
UPDATE route SET 
    route_name = 'Tuyến Sáng Số 1'
WHERE id = 'R001';

UPDATE route SET 
    route_name = 'Tuyến Sáng Số 2'
WHERE id = 'R002';

-- Add more pickup/dropoff locations for routes
INSERT INTO location (id, name, address, latitude, longitude, type) VALUES
('L006', 'Điểm đón Cách Mạng Tháng 8', '100 Cách Mạng Tháng 8, Q3', 10.768000, 106.665000, 'PICKUP_POINT'),
('L007', 'Điểm đón Điện Biên Phủ', '200 Điện Biên Phủ, Q3', 10.770000, 106.667000, 'PICKUP_POINT'),
('L008', 'Điểm trả Pasteur', '50 Pasteur, Q1', 10.763500, 106.661500, 'PICKUP_POINT'),
('L009', 'Điểm trả Lý Tự Trọng', '80 Lý Tự Trọng, Q1', 10.764500, 106.662500, 'PICKUP_POINT'),
('L010', 'Điểm trả Nam Kỳ Khởi Nghĩa', '120 Nam Kỳ Khởi Nghĩa, Q1', 10.765500, 106.663500, 'PICKUP_POINT')
ON DUPLICATE KEY UPDATE name=VALUES(name);
