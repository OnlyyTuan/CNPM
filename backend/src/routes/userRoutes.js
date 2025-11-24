const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Lấy danh sách users
router.get("/", userController.getAllUsers);

// Lấy user theo id
router.get("/:id", userController.getUserById);

// Cập nhật user
router.put("/:id", userController.updateUser);

// Xóa user
router.delete("/:id", userController.deleteUser);

module.exports = router;
