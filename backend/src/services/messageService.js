// backend/src/services/messageService.js
const { Message, User } = require('../db');
const { Op } = require('sequelize');

const getChatHistory = async (currentUserId, otherUserId) => {
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId },
      ],
    },
    include: [
      { model: User, as: 'Sender', attributes: ['username'] },
      { model: User, as: 'Recipient', attributes: ['username'] },
    ],
    order: [['timestamp', 'ASC']],
  });
  return messages;
};

module.exports = {
  getChatHistory,
};
