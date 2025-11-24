const express = require('express');
const router = express.Router();
const db = require('../db');

// ==================== GPS TRACKING APIs ====================

// 1. Lấy vị trí hiện tại của TẤT CẢ xe bus (cho Admin)
router.get('/buses/locations', async (req, res) => {
  try {
    const [buses] = await db.query(`
      SELECT 
        b.id as bus_id,
        b.status,
        b.speed,
        b.lastUpdate,
        b.route_id,
        l.name as location_name,
        l.latitude,
        l.longitude,
        d.id as driver_id,
        d.name as driver_name,
        d.phone as driver_phone,
        r.name as route_name
      FROM Bus b
      LEFT JOIN Location l ON b.currentLocation_id = l.id
      LEFT JOIN Driver d ON b.driver_id = d.id
      LEFT JOIN Route r ON b.route_id = r.id
      WHERE b.status = 'ACTIVE'
      ORDER BY b.lastUpdate DESC
    `);
    res.json(buses);
  } catch (error) {
    console.error('Error fetching all bus locations:', error);
    res.status(500).json({ error: 'Không thể lấy vị trí xe bus' });
  }
});

// 2. Lấy vị trí của MỘT xe bus cụ thể (theo ID)
router.get('/buses/:busId/location', async (req, res) => {
  try {
    const { busId } = req.params;
    const [buses] = await db.query(`
      SELECT 
        b.id as bus_id,
        b.capacity,
        b.status,
        b.speed,
        b.lastUpdate,
        b.route_id,
        l.name as location_name,
        l.latitude,
        l.longitude,
        l.address,
        d.id as driver_id,
        d.name as driver_name,
        d.phone as driver_phone,
        r.name as route_name,
        r.startTime,
        r.endTime
      FROM Bus b
      LEFT JOIN Location l ON b.currentLocation_id = l.id
      LEFT JOIN Driver d ON b.driver_id = d.id
      LEFT JOIN Route r ON b.route_id = r.id
      WHERE b.id = ?
    `, [busId]);

    if (buses.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy xe bus' });
    }

    res.json(buses[0]);
  } catch (error) {
    console.error('Error fetching bus location:', error);
    res.status(500).json({ error: 'Không thể lấy vị trí xe bus' });
  }
});

// 3. Lấy vị trí xe bus của học sinh (cho Phụ huynh)
router.get('/students/:studentId/bus-location', async (req, res) => {
  try {
    const { studentId } = req.params;
    const [result] = await db.query(`
      SELECT 
        s.id as student_id,
        s.name as student_name,
        s.class,
        s.status as student_status,
        b.id as bus_id,
        b.status as bus_status,
        b.speed,
        b.lastUpdate,
        l.name as current_location_name,
        l.latitude as current_latitude,
        l.longitude as current_longitude,
        pickup.name as pickup_location_name,
        pickup.latitude as pickup_latitude,
        pickup.longitude as pickup_longitude,
        pickup.estimatedTime as pickup_time,
        dropoff.name as dropoff_location_name,
        dropoff.latitude as dropoff_latitude,
        dropoff.longitude as dropoff_longitude,
        d.name as driver_name,
        d.phone as driver_phone,
        r.name as route_name
      FROM Student s
      LEFT JOIN Bus b ON s.assignedBus_id = b.id
      LEFT JOIN Location l ON b.currentLocation_id = l.id
      LEFT JOIN Location pickup ON s.pickupLocation_id = pickup.id
      LEFT JOIN Location dropoff ON s.dropoffLocation_id = dropoff.id
      LEFT JOIN Driver d ON b.driver_id = d.id
      LEFT JOIN Route r ON b.route_id = r.id
      WHERE s.id = ?
    `, [studentId]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy học sinh' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching student bus location:', error);
    res.status(500).json({ error: 'Không thể lấy vị trí xe bus của học sinh' });
  }
});

// 4. Cập nhật vị trí GPS của xe bus (cho Tài xế/IoT Device)
router.put('/buses/:busId/update-location', async (req, res) => {
  try {
    const { busId } = req.params;
    const { latitude, longitude, speed, locationId } = req.body;

    // Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Thiếu thông tin tọa độ GPS' });
    }

    // Bắt đầu transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Cập nhật vị trí xe bus
      await connection.query(`
        UPDATE Bus 
        SET currentLocation_id = ?,
            speed = ?,
            lastUpdate = NOW()
        WHERE id = ?
      `, [locationId || null, speed || 0, busId]);

      // Lưu lịch sử vị trí vào LocationLog
      await connection.query(`
        INSERT INTO LocationLog (bus_id, timestamp, latitude, longitude, speed)
        VALUES (?, NOW(), ?, ?, ?)
      `, [busId, latitude, longitude, speed || 0]);

      await connection.commit();
      connection.release();

      res.json({ 
        success: true, 
        message: 'Đã cập nhật vị trí xe bus',
        busId,
        latitude,
        longitude,
        speed
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error updating bus location:', error);
    res.status(500).json({ error: 'Không thể cập nhật vị trí xe bus' });
  }
});

// 5. Lấy lịch sử di chuyển của xe bus (cho Admin)
router.get('/buses/:busId/location-history', async (req, res) => {
  try {
    const { busId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    let query = `
      SELECT 
        id,
        bus_id,
        timestamp,
        latitude,
        longitude,
        speed
      FROM LocationLog
      WHERE bus_id = ?
    `;
    const params = [busId];

    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));

    const [history] = await db.query(query, params);
    res.json(history);
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({ error: 'Không thể lấy lịch sử di chuyển' });
  }
});

// 6. Lấy danh sách điểm dừng của tuyến đường (cho hiển thị trên bản đồ)
router.get('/routes/:routeId/stops', async (req, res) => {
  try {
    const { routeId } = req.params;
    const [stops] = await db.query(`
      SELECT 
        rs.route_id,
        rs.stop_order,
        l.id as location_id,
        l.name,
        l.address,
        l.latitude,
        l.longitude,
        l.type,
        l.estimatedTime
      FROM Route_Stop rs
      JOIN Location l ON rs.location_id = l.id
      WHERE rs.route_id = ?
      ORDER BY rs.stop_order ASC
    `, [routeId]);

    res.json(stops);
  } catch (error) {
    console.error('Error fetching route stops:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách điểm dừng' });
  }
});

// 7. Lấy danh sách học sinh trên xe (cho Tài xế)
router.get('/buses/:busId/students', async (req, res) => {
  try {
    const { busId } = req.params;
    const [students] = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.class,
        s.grade,
        s.status,
        s.parentContact,
        pickup.name as pickup_location,
        pickup.latitude as pickup_lat,
        pickup.longitude as pickup_lng,
        dropoff.name as dropoff_location,
        dropoff.latitude as dropoff_lat,
        dropoff.longitude as dropoff_lng
      FROM Student s
      LEFT JOIN Location pickup ON s.pickupLocation_id = pickup.id
      LEFT JOIN Location dropoff ON s.dropoffLocation_id = dropoff.id
      WHERE s.assignedBus_id = ?
      ORDER BY s.name ASC
    `, [busId]);

    res.json(students);
  } catch (error) {
    console.error('Error fetching bus students:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách học sinh' });
  }
});

// 8. Lấy thông tin xe bus của tài xế (cho Tài xế)
router.get('/drivers/:driverId/bus', async (req, res) => {
  try {
    const { driverId } = req.params;
    const [result] = await db.query(`
      SELECT 
        d.id as driver_id,
        d.name as driver_name,
        b.id as bus_id,
        b.capacity,
        b.status,
        b.speed,
        b.lastUpdate,
        l.latitude,
        l.longitude,
        l.name as current_location,
        r.id as route_id,
        r.name as route_name
      FROM Driver d
      LEFT JOIN Bus b ON d.currentBus_id = b.id
      LEFT JOIN Location l ON b.currentLocation_id = l.id
      LEFT JOIN Route r ON b.route_id = r.id
      WHERE d.id = ?
    `, [driverId]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching driver bus:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin xe bus' });
  }
});

module.exports = router;