const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

// Lấy danh sách users
router.get("/", userController.getAllUsers);

// Lấy user theo id
router.get("/:id", userController.getUserById);

// Cập nhật user
router.put("/:id", userController.updateUser);

// Xóa user
router.delete("/:id", userController.deleteUser);

// Admin: set/reset password for a user
router.put(
  "/:id/password",
  auth.protect,
  auth.restrictTo("admin"),
  userController.updatePassword
);

module.exports = router;
