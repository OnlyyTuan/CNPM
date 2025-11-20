// backend/src/controllers/parentController.js

const parentService = require('../services/parentService');
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
            res.status(500).send({ message: "Lỗi khi lấy danh sách phụ huynh.", error: error.message });
        }
    },
    
    // [POST] /api/v1/parents - Tạo Parent, Student & User (Transaction)
    async createParentAndStudent(req, res) {
        const { userData, parentData, studentData } = req.body;
        try {
            // Giả sử hàm này tồn tại trong parentService.js
            const result = await parentService.createParentAndStudent(userData, parentData, studentData);
            res.status(201).send({ 
                message: "Tạo tài khoản phụ huynh và học sinh thành công!", 
                parent: result.parent,
                student: result.student
            });
        } catch (error) {
            res.status(400).send({ message: "Lỗi khi tạo phụ huynh/học sinh. Kiểm tra dữ liệu (ID trùng, User trùng, v.v.).", error: error.message });
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
            res.status(500).send({ message: "Lỗi khi lấy chi tiết học sinh.", error: error.message });
        }
    }
};

module.exports = parentController;