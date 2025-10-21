// backend/src/services/scheduleService.js
// Service xử lý logic nghiệp vụ cho Lịch trình

const { v4: uuidv4 } = require('uuid');
const db = require('../database');

class ScheduleService {
  /**
   * Lấy tất cả lịch trình với thông tin xe buýt và tuyến đường
   */
  async getAllSchedules() {
    try {
      const [schedules] = await db.query(`
        SELECT 
          s.*,
          b.license_plate,
          b.capacity,
          r.route_name,
          r.distance,
          r.estimated_duration,
          d.full_name as driver_name,
          d.phone as driver_phone
        FROM schedule s
        LEFT JOIN bus b ON s.bus_id = b.id
        LEFT JOIN route r ON s.route_id = r.id
        LEFT JOIN driver d ON b.driver_id = d.id
        ORDER BY s.start_time DESC
      `);
      return schedules;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách lịch trình: ${error.message}`);
    }
  }

  /**
   * Lấy lịch trình theo ID
   */
  async getScheduleById(id) {
    try {
      const [schedules] = await db.query(`
        SELECT 
          s.*,
          b.license_plate,
          b.capacity,
          r.route_name,
          r.distance,
          r.estimated_duration,
          d.full_name as driver_name,
          d.phone as driver_phone
        FROM schedule s
        LEFT JOIN bus b ON s.bus_id = b.id
        LEFT JOIN route r ON s.route_id = r.id
        LEFT JOIN driver d ON b.driver_id = d.id
        WHERE s.id = ?
      `, [id]);
      
      return schedules[0] || null;
    } catch (error) {
      throw new Error(`Lỗi khi lấy lịch trình: ${error.message}`);
    }
  }

  /**
   * Lấy lịch trình theo khoảng thời gian
   */
  async getSchedulesByDateRange(startDate, endDate) {
    try {
      const [schedules] = await db.query(`
        SELECT 
          s.*,
          b.license_plate,
          b.capacity,
          r.route_name,
          r.distance,
          r.estimated_duration,
          d.full_name as driver_name
        FROM schedule s
        LEFT JOIN bus b ON s.bus_id = b.id
        LEFT JOIN route r ON s.route_id = r.id
        LEFT JOIN driver d ON b.driver_id = d.id
        WHERE s.start_time >= ? AND s.start_time <= ?
        ORDER BY s.start_time ASC
      `, [startDate, endDate]);
      
      return schedules;
    } catch (error) {
      throw new Error(`Lỗi khi lấy lịch trình theo thời gian: ${error.message}`);
    }
  }

  /**
   * Tạo lịch trình mới
   */
  async createSchedule(scheduleData) {
    try {
      const { bus_id, route_id, start_time, end_time, status = 'PLANNED' } = scheduleData;

      // Kiểm tra xe buýt có tồn tại không
      const [buses] = await db.query('SELECT id FROM bus WHERE id = ?', [bus_id]);
      if (buses.length === 0) {
        throw new Error('Xe buýt không tồn tại');
      }

      // Kiểm tra tuyến đường có tồn tại không
      const [routes] = await db.query('SELECT id FROM route WHERE id = ?', [route_id]);
      if (routes.length === 0) {
        throw new Error('Tuyến đường không tồn tại');
      }

      // Kiểm tra xung đột lịch trình (xe buýt đã có lịch trong khoảng thời gian này)
      const [conflicts] = await db.query(`
        SELECT id FROM schedule 
        WHERE bus_id = ? 
        AND status NOT IN ('COMPLETED', 'CANCELED')
        AND (
          (start_time <= ? AND end_time >= ?) OR
          (start_time <= ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `, [bus_id, start_time, start_time, end_time, end_time, start_time, end_time]);

      if (conflicts.length > 0) {
        throw new Error('Xe buýt đã có lịch trình trong khoảng thời gian này');
      }

      const scheduleId = uuidv4();
      await db.query(`
        INSERT INTO schedule (id, bus_id, route_id, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [scheduleId, bus_id, route_id, start_time, end_time, status]);

      return await this.getScheduleById(scheduleId);
    } catch (error) {
      throw new Error(`Lỗi khi tạo lịch trình: ${error.message}`);
    }
  }

  /**
   * Cập nhật lịch trình
   */
  async updateSchedule(id, scheduleData) {
    try {
      const { bus_id, route_id, start_time, end_time, status } = scheduleData;

      // Kiểm tra lịch trình có tồn tại không
      const existingSchedule = await this.getScheduleById(id);
      if (!existingSchedule) {
        throw new Error('Lịch trình không tồn tại');
      }

      // Kiểm tra xung đột nếu có thay đổi thời gian hoặc xe buýt
      if (bus_id || start_time || end_time) {
        const checkBusId = bus_id || existingSchedule.bus_id;
        const checkStartTime = start_time || existingSchedule.start_time;
        const checkEndTime = end_time || existingSchedule.end_time;

        const [conflicts] = await db.query(`
          SELECT id FROM schedule 
          WHERE bus_id = ? 
          AND id != ?
          AND status NOT IN ('COMPLETED', 'CANCELED')
          AND (
            (start_time <= ? AND end_time >= ?) OR
            (start_time <= ? AND end_time >= ?) OR
            (start_time >= ? AND end_time <= ?)
          )
        `, [checkBusId, id, checkStartTime, checkStartTime, checkEndTime, checkEndTime, checkStartTime, checkEndTime]);

        if (conflicts.length > 0) {
          throw new Error('Xe buýt đã có lịch trình trong khoảng thời gian này');
        }
      }

      const updates = [];
      const values = [];

      if (bus_id) {
        updates.push('bus_id = ?');
        values.push(bus_id);
      }
      if (route_id) {
        updates.push('route_id = ?');
        values.push(route_id);
      }
      if (start_time) {
        updates.push('start_time = ?');
        values.push(start_time);
      }
      if (end_time) {
        updates.push('end_time = ?');
        values.push(end_time);
      }
      if (status) {
        updates.push('status = ?');
        values.push(status);
      }

      if (updates.length === 0) {
        return existingSchedule;
      }

      values.push(id);
      await db.query(
        `UPDATE schedule SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getScheduleById(id);
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật lịch trình: ${error.message}`);
    }
  }

  /**
   * Xóa lịch trình
   */
  async deleteSchedule(id) {
    try {
      const schedule = await this.getScheduleById(id);
      if (!schedule) {
        throw new Error('Lịch trình không tồn tại');
      }

      // Không cho phép xóa lịch trình đang diễn ra
      if (schedule.status === 'ONGOING') {
        throw new Error('Không thể xóa lịch trình đang diễn ra');
      }

      await db.query('DELETE FROM schedule WHERE id = ?', [id]);
      return { success: true, message: 'Xóa lịch trình thành công' };
    } catch (error) {
      throw new Error(`Lỗi khi xóa lịch trình: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê lịch trình
   */
  async getScheduleStatistics() {
    try {
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total_schedules,
          SUM(CASE WHEN status = 'PLANNED' THEN 1 ELSE 0 END) as planned,
          SUM(CASE WHEN status = 'ONGOING' THEN 1 ELSE 0 END) as ongoing,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'CANCELED' THEN 1 ELSE 0 END) as canceled
        FROM schedule
      `);

      return stats[0];
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê: ${error.message}`);
    }
  }
}

module.exports = new ScheduleService();
