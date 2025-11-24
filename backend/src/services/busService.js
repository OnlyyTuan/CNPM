// backend/src/services/busService.js
const { Bus, Driver, Route, Location } = require('../db');

const busService = {
    async getAllBuses() {
        // Lấy danh sách Bus, bao gồm thông tin Driver, Route và Vị trí hiện tại
        return Bus.findAll({
            include: [
                {
                    model: Driver,
                    // PHẢI DÙNG BÍ DANH ĐÃ ĐỊNH NGHĨA TRONG db.js
                    as: 'CurrentDriver',
                    // Chỉ lấy các thuộc tính cần thiết
                    attributes: ['id', 'full_name', 'phone'], 
                },
                {
                    model: Route,
                    // PHẢI DÙNG BÍ DANH ĐÃ ĐỊNH NGHĨA TRONG db.js
                    as: 'CurrentRoute',
                    attributes: ['id', 'route_name'], 
                },
                {
                    model: Location,
                    // ĐÃ ĐÚNG
                    as: 'CurrentLocation',
                    attributes: ['id', 'name', 'latitude', 'longitude'],
                },
            ],
            order: [['license_plate', 'ASC']]
        });
    }

    // Bạn có thể thêm các hàm khác như getBusById, updateBus, v.v.
};

module.exports = busService;