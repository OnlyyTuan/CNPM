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
    }, {
        tableName: 'user',
        timestamps: true,
        createdAt: 'created_at', // Khớp với tên cột trong database
        updatedAt: 'updated_at', // Khớp với tên cột trong database
    });
    return User;
};