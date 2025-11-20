// backend/src/socketManager.js
const jwt = require('jsonwebtoken');
const { Message, User } = require('./db');

const initializeSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} for user ${socket.user.id}`);

    socket.join(socket.user.id.toString());

    socket.on('send_message', async (data) => {
      console.log('--- Tin nhắn mới nhận từ Client ---');
      console.log('Dữ liệu:', data);

      const { recipientId, messageContent } = data;
      const senderId = socket.user.id;
      console.log(`Người gửi (Sender ID): ${senderId}, Người nhận (Recipient ID): ${recipientId}`);

      try {
        const message = await Message.create({
          senderId,
          recipientId,
          messageContent,
        });

        const messageWithSender = await Message.findByPk(message.id, {
          include: [{ model: User, as: 'Sender', attributes: ['username'] }],
        });

        console.log(`Đang gửi tin nhắn đến phòng của người nhận: ${recipientId}`);
        io.to(recipientId.toString()).emit('receive_message', messageWithSender);
        
        console.log(`Đang gửi lại tin nhắn xác nhận đến phòng của người gửi: ${senderId}`);
        io.to(senderId.toString()).emit('receive_message', messageWithSender);

        console.log('--- Gửi tin nhắn hoàn tất ---');
      } catch (error) {
        console.error('LỖI khi lưu hoặc gửi tin nhắn:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initializeSocket };
