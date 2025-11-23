// backend/src/models/ChatMessage.js
module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define(
    "ChatMessage",
    {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "sender_id",
      },
      receiverId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "receiver_id",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_read",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
    },
    {
      tableName: "chat_message",
      timestamps: false,
      underscored: true,
    }
  );

  return ChatMessage;
};
