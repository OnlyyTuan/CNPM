// backend/src/models/User.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        role: {
            type: DataTypes.STRING(50), // ADMIN, DRIVER, PARENT
            allowNull: false,
        },
        // Sequelize sẽ tự động thêm createdAt và updatedAt
    }, {
        tableName: 'user', // Tên bảng trong DB (quan trọng)
        timestamps: true,
        // Model không có trường updated_at nếu bạn dùng updated_at TIMESTAMP
        // Tuy nhiên, Sequelize mặc định dùng camelCase (updatedAt)
    });
    return User;
};