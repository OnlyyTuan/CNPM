const db = require('../db');

const notificationController = {
  // Get notifications for logged in user
  async getMyNotifications(req, res) {
    try {
      const userId = req.user.id;
      const notifications = await db.Notification.findAll({
        where: { userId: userId },
        order: [['created_at', 'DESC']]
      });
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ success: false, message: "Lỗi khi lấy thông báo" });
    }
  },

  // Send notification to all parents of students on a specific bus
  async sendToBus(req, res) {
    try {
      const { busId, title, message } = req.body;
      
      if (!busId || !title || !message) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin (busId, title, message)" });
      }

      // 1. Find students on the bus
      const students = await db.Student.findAll({
        where: { assignedBusId: busId },
        attributes: ['parentId']
      });

      if (!students.length) {
        return res.status(404).json({ success: false, message: "Không có học sinh nào trên xe này." });
      }

      // Get unique parent IDs
      const parentIds = [...new Set(students.map(s => s.parentId).filter(id => id))];

      if (!parentIds.length) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phụ huynh liên kết với học sinh trên xe này." });
      }

      // 2. Find User IDs associated with these parents
      const parents = await db.Parent.findAll({
        where: { id: parentIds },
        attributes: ['userId']
      });

      const userIds = parents.map(p => p.userId).filter(id => id);

      if (!userIds.length) {
        return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản người dùng của các phụ huynh này." });
      }

      // 3. Create notifications
      const notificationsData = userIds.map(userId => ({
        userId,
        title,
        message,
        type: 'BUS_ANNOUNCEMENT',
        createdAt: new Date()
      }));

      await db.Notification.bulkCreate(notificationsData);

      // Optional: Emit socket event here if needed in the future

      res.status(200).json({ 
        success: true, 
        message: `Đã gửi thông báo thành công tới ${userIds.length} phụ huynh.`,
        recipientCount: userIds.length
      });

    } catch (error) {
      console.error("Error sending bus notification:", error);
      res.status(500).json({ success: false, message: "Lỗi server khi gửi thông báo." });
    }
  }
};

module.exports = notificationController;
