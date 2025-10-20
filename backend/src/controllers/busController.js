// backend/src/controllers/busController.js
// Vẫn giữ require ở đây để Models được định nghĩa trước khi sử dụng
const db = require('../db'); 
const { Bus, Driver, Route, Location } = db; 

const busController = {
    // [GET] /api/v1/buses - Lấy danh sách xe buýt
    async findAll(req, res) {
        try {
            const buses = await Bus.findAll({
                // PHẢI DÙNG BÍ DANH (AS) ĐÃ ĐỊNH NGHĨA TRONG DB.JS
                include: [
                    { 
                        model: Driver, 
                        as: 'CurrentDriver', // SỬA: Dùng bí danh CurrentDriver
                        attributes: ['id', 'full_name', 'phone'], // Lưu ý: dùng full_name thay vì name
                        required: false 
                    }, 
                    { 
                        model: Route, 
                        as: 'CurrentRoute', // SỬA: Dùng bí danh CurrentRoute
                        attributes: ['id', 'route_name'], // Lưu ý: dùng route_name thay vì name
                        required: false 
                    }, 
                    { 
                        model: Location, 
                        as: 'CurrentLocation', // ĐÃ ĐÚNG
                        attributes: ['id', 'name', 'latitude', 'longitude'], 
                        required: false 
                    }
                ],
                order: [['license_plate', 'ASC']] // Sắp xếp theo biển số xe
            });
            res.send(buses);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách xe buýt:", error.message);
            res.status(500).send({ message: "Lỗi khi lấy danh sách xe buýt.", error: error.message });
        }
    },

    // [POST] /api/v1/buses - Thêm xe buýt mới
    async create(req, res) {
        const { id, license_plate, capacity, status, driver_id, route_id, current_location_id } = req.body;
        try {
            const newBus = await Bus.create({
                id: id,
                license_plate: license_plate, // Cần có license_plate
                capacity: capacity, 
                status: status || 'ACTIVE',
                // Các FK có thể được tạo cùng lúc nếu driver_id, route_id, location_id có trong req.body
            });
            res.status(201).send(newBus);
        } catch (error) {
            // Lỗi 400 cho lỗi validation hoặc trùng khóa chính/duy nhất
            res.status(400).send({ message: "Lỗi khi tạo xe buýt mới. (Có thể trùng ID hoặc biển số)", error: error.message });
        }
    },

    // [PUT] /api/v1/buses/:id - Cập nhật thông tin xe buýt
    async update(req, res) {
        const { id } = req.params;
        const updateData = req.body;
        try {
            // Loại bỏ các trường liên quan đến FK 1-1 không cần update trực tiếp nếu bạn muốn logic phức tạp hơn
            // Nếu bạn cho phép cập nhật FK qua body, bạn không cần delete
            // NHƯNG nếu delete, PHẢI DÙNG TÊN CỘT CHÍNH XÁC:
            delete updateData.current_location_id; // SỬA: dùng gạch dưới
            
            const [updated] = await Bus.update(updateData, {
                where: { id: id }
            });

            if (updated) {
                // Lấy lại xe buýt đã cập nhật, bao gồm các relationships
                const updatedBus = await Bus.findByPk(id, {
                    include: [
                        { model: Driver, as: 'CurrentDriver', attributes: ['id', 'full_name', 'phone'], required: false },
                        { model: Route, as: 'CurrentRoute', attributes: ['id', 'route_name'], required: false },
                        { model: Location, as: 'CurrentLocation', attributes: ['id', 'name', 'latitude', 'longitude'], required: false }
                    ]
                });
                res.send(updatedBus);
            } else {
                res.status(404).send({ message: "Không tìm thấy xe buýt." });
            }
        } catch (error) {
            res.status(500).send({ message: "Lỗi khi cập nhật xe buýt.", error: error.message });
        }
    },

    // [DELETE] /api/v1/buses/:id - Xóa xe buýt
    async delete(req, res) {
        const { id } = req.params;
        try {
            const result = await Bus.destroy({
                where: { id: id }
            });

            if (result) {
                res.status(200).send({ message: "Xóa xe buýt thành công." });
            } else {
                res.status(404).send({ message: "Không tìm thấy xe buýt." });
            }
        } catch (error) {
            res.status(500).send({ message: "Lỗi khi xóa xe buýt. Vui lòng kiểm tra các ràng buộc.", error: error.message });
        }
    },
};

module.exports = busController;