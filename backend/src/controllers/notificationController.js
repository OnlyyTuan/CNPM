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
  }
};

module.exports = notificationController;
