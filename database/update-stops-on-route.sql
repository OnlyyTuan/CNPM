-- Cập nhật điểm dừng để khớp với tuyến đường
DELETE FROM location;

-- Điểm dừng cho tuyến R001 (từ Bến xe Miền Đông đến ĐHQG)
INSERT INTO location (id, name, address, latitude, longitude, type) VALUES
('L001', 'Bến xe Miền Đông', 'Quận Bình Thạnh', 10.815010, 106.702700, 'PICKUP_POINT'),
('L002', 'Ngã tư Thủ Đức', 'Quận Thủ Đức', 10.805200, 106.692500, 'PICKUP_POINT'),
('L003', 'Đại học Bách Khoa', 'Quận Thủ Đức', 10.790000, 106.680000, 'PICKUP_POINT'),
('L004', 'Đại học Quốc Gia', 'Khu phố 6, Linh Trung', 10.772800, 106.665500, 'SCHOOL'),

-- Điểm dừng cho tuyến R002 (từ Q1 đến Nhà hát)
('L005', 'Trung tâm Q1', 'Quận 1', 10.762622, 106.660172, 'PICKUP_POINT'),
('L006', 'Chợ Bến Thành', 'Quận 1', 10.770000, 106.670000, 'PICKUP_POINT'),
('L007', 'Nhà hát Thành phố', 'Quận 1', 10.780000, 106.675000, 'PICKUP_POINT'),

-- Thêm một số điểm dừng chung
('L008', 'Công viên Gia Định', 'Quận Gò Vấp', 10.812000, 106.678000, 'PICKUP_POINT'),
('L009', 'Bệnh viện Thống Nhất', 'Quận Tân Bình', 10.795000, 106.655000, 'PICKUP_POINT'),
('L010', 'Bãi đỗ xe trường', 'Sân sau trường', 10.772900, 106.665600, 'PARKING');

-- Cập nhật tên tuyến
UPDATE route SET route_name = 'Tuyến 1: Bến xe Miền Đông - ĐHQG' WHERE id = 'R001';
UPDATE route SET route_name = 'Tuyến 2: Trung tâm Q1 - Nhà hát' WHERE id = 'R002';
