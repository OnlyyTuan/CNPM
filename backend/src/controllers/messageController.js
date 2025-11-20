// backend/src/controllers/messageController.js
const messageService = require('../services/messageService');

const getChatHistory = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;
    const history = await messageService.getChatHistory(currentUserId, otherUserId);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChatHistory,
};
