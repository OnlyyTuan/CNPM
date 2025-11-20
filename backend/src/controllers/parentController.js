// backend/src/controllers/parentController.js

const parentService = require("../services/parentService");
// Nếu bạn sử dụng userService trong createParentAndStudent, hãy thêm nó vào:
// const userService = require('../services/userService');

const parentController = {
  // [GET] /api/v1/parents - Lấy danh sách Phụ huynh (kèm Học sinh)
  async findAllParents(req, res) {
    try {
      // Đảm bảo tên hàm gọi khớp với tên hàm trong parentService.js
      const parents = await parentService.getAllParentsWithStudents();
      res.send(parents);
    } catch (error) {
      res.status(500).send({
        message: "Lỗi khi lấy danh sách phụ huynh.",
        error: error.message,
      });
    }
  },

  // [POST] /api/v1/parents - Tạo Parent, Student & User (Transaction)
  async createParentAndStudent(req, res) {
    const { userData, parentData, studentData } = req.body;
    try {
      // Giả sử hàm này tồn tại trong parentService.js
      const result = await parentService.createParentAndStudent(
        userData,
        parentData,
        studentData
      );
      res.status(201).send({
        message: "Tạo tài khoản phụ huynh và học sinh thành công!",
        parent: result.parent,
        student: result.student,
      });
    } catch (error) {
      // Log chi tiết lỗi để giúp debug (Sequelize validation/unique errors)
      console.error("createParentAndStudent error:", error);
      const details =
        error && error.errors
          ? error.errors.map((e) => ({ path: e.path, message: e.message }))
          : null;
      res.status(400).send({
        message:
          "Lỗi khi tạo phụ huynh/học sinh. Kiểm tra dữ liệu (ID trùng, User trùng, v.v.).",
        error: error.message,
        details,
      });
    }
  },

  // [GET] /api/v1/parents/students/:id - Lấy chi tiết Học sinh
  async findStudentDetail(req, res) {
    try {
      const student = await parentService.getStudentDetail(req.params.id);
      if (student) {
        res.send(student);
      } else {
        res.status(404).send({ message: "Không tìm thấy học sinh." });
      }
    } catch (error) {
      res.status(500).send({
        message: "Lỗi khi lấy chi tiết học sinh.",
        error: error.message,
      });
    }
  },
  // [GET] /api/v1/parents/:id - Lấy thông tin Parent theo id
  async getParentById(req, res) {
    try {
      const p = await parentService.getParentById(req.params.id);
      if (!p)
        return res.status(404).send({ message: "Không tìm thấy phụ huynh." });
      res.status(200).send(p);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Lỗi khi lấy phụ huynh.", error: error.message });
    }
  },

  // [PUT] /api/v1/parents/:id - Cập nhật thông tin Parent
  async updateParent(req, res) {
    try {
      const parentId = req.params.id;
      // Expect payload like { parentData: { full_name, phone, address } }
      const payload = req.body?.parentData || req.body || {};
      const updated = await parentService.updateParent(parentId, payload);
      if (!updated)
        return res
          .status(404)
          .send({ message: "Không tìm thấy phụ huynh để cập nhật." });
      res.status(200).send(updated);
    } catch (error) {
      // Handle unique constraint or validation errors
      res
        .status(500)
        .send({ message: "Lỗi khi cập nhật phụ huynh.", error: error.message });
    }
  },

  // [POST] /api/v1/parents/link - Tạo Parent cho User đã tồn tại
  async createParentForUser(req, res) {
    try {
      const { userId, parentData } = req.body || {};
      if (!userId)
        return res.status(400).send({ message: "userId is required" });
      const created = await parentService.createParentForUser(
        userId,
        parentData || {}
      );
      res.status(201).send(created);
    } catch (error) {
      console.error("createParentForUser error", error);
      res.status(500).send({
        message: "Lỗi khi tạo phụ huynh cho user.",
        error: error.message,
      });
    }
  },
};

module.exports = parentController;
