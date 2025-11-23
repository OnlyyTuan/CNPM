// backend/src/controllers/locationController.js
const db = require('../db');
const Location = db.Location;
const { Op } = require('sequelize');

const locationController = {
  // [GET] /api/v1/routes/locations - Lấy danh sách điểm dừng
  async findAll(req, res) {
    console.log('🔵 locationController.findAll được gọi!');
    try {
      const locations = await Location.findAll({
        order: [['name', 'ASC']]
      });
      console.log('✅ Tìm thấy', locations.length, 'điểm dừng');
      res.json(locations);
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách điểm dừng:', error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách điểm dừng', error: error.message });
    }
  },

  // [POST] /api/v1/routes/locations - Thêm điểm dừng mới
  async create(req, res) {
    try {
      console.log('📝 Nhận request thêm điểm dừng:', req.body);
      const { name, address, latitude, longitude } = req.body;
      
      if (!name || !address || !latitude || !longitude) {
        console.log('❌ Thiếu thông tin:', { name, address, latitude, longitude });
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }

      // Tìm tất cả locations có ID theo format LOC### chính xác
      const locations = await Location.findAll({
        where: {
          id: {
            [Op.regexp]: '^LOC[0-9]{3}$'
          }
        },
        order: [['id', 'DESC']],
        limit: 1
      });

      let newId = 'LOC001';
      if (locations && locations.length > 0) {
        const lastLocation = locations[0];
        const match = lastLocation.id.match(/^LOC(\d{3})$/);
        if (match) {
          const lastNum = parseInt(match[1]);
          newId = `LOC${String(lastNum + 1).padStart(3, '0')}`;
        }
      }
      console.log('🆔 Tạo ID mới:', newId);

      const location = await Location.create({
        id: newId,
        name,
        address,
        latitude,
        longitude,
        type: 'stop'
      });

      console.log('✅ Tạo điểm dừng thành công:', location.toJSON());
      res.status(201).json(location);
    } catch (error) {
      console.error('❌ Lỗi khi thêm điểm dừng:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({ message: 'Lỗi khi thêm điểm dừng', error: error.message });
    }
  },

  // [PUT] /api/v1/routes/locations/:id - Cập nhật điểm dừng
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, address, latitude, longitude } = req.body;

      const location = await Location.findByPk(id);
      if (!location) {
        return res.status(404).json({ message: 'Không tìm thấy điểm dừng' });
      }

      await location.update({
        name,
        address,
        latitude,
        longitude
      });

      res.json(location);
    } catch (error) {
      console.error('Lỗi khi cập nhật điểm dừng:', error);
      res.status(500).json({ message: 'Lỗi khi cập nhật điểm dừng' });
    }
  },

  // [DELETE] /api/v1/routes/locations/:id - Xóa điểm dừng
  async delete(req, res) {
    try {
      const { id } = req.params;

      const location = await Location.findByPk(id);
      if (!location) {
        return res.status(404).json({ message: 'Không tìm thấy điểm dừng' });
      }

      await location.destroy();
      res.json({ message: 'Xóa điểm dừng thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa điểm dừng:', error);
      res.status(500).json({ message: 'Lỗi khi xóa điểm dừng' });
    }
  }
};

module.exports = locationController;
