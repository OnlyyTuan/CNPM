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
      const { name, address, latitude, longitude } = req.body;
      
      if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }

      // Tạo ID tự động dạng LOC001, LOC002, ...
      const lastLocation = await Location.findOne({
        where: {
          id: {
            [Op.like]: 'LOC%'
          }
        },
        order: [['id', 'DESC']]
      });

      let newId = 'LOC001';
      if (lastLocation) {
        const lastNum = parseInt(lastLocation.id.replace('LOC', ''));
        newId = `LOC${String(lastNum + 1).padStart(3, '0')}`;
      }

      const location = await Location.create({
        id: newId,
        name,
        address,
        latitude,
        longitude,
        type: 'stop'
      });

      res.status(201).json(location);
    } catch (error) {
      console.error('Lỗi khi thêm điểm dừng:', error);
      res.status(500).json({ message: 'Lỗi khi thêm điểm dừng' });
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
