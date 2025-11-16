// backend/src/models/Message.js
module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      senderId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: 'user', // Corrected from 'Users'
          key: 'id',
        },
      },
      recipientId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: 'user', // Corrected from 'Users'
          key: 'id',
        },
      },
      messageContent: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      tableName: 'message', // Corrected from 'Messages'
      timestamps: false,
      underscored: true,
    });
  
    return Message;
  };