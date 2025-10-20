// backend/src/controllers/studentController.js
const { Student, Bus, Location, Parent } = require('../db'); // Import các Models liên quan

const studentController = {
    // [GET] /api/v1/students - Lấy danh sách học sinh
    async findAll(req, res) {
        try {
            const students = await Student.findAll({
                // JOIN để lấy thông tin Xe được gán, Điểm đón/trả và Phụ huynh
                include: [
                    { model: Bus, as: 'AssignedBus', attributes: ['id', 'capacity'] }, // assignedBus_id FK to Bus.id
                    { model: Location, as: 'PickupLocation', attributes: ['id', 'name', 'address'] }, // pickupLocation_id FK to Location.id
                    { model: Location, as: 'DropoffLocation', attributes: ['id', 'name', 'address'] }, // dropoffLocation_id FK to Location.id
                    { model: Parent, as: 'Parent', attributes: ['id', 'name', 'phone'] } // parent_id FK to parent.id
                ],
                order: [['name', 'ASC']]
            });
            res.send(students);
        } catch (error) {
            res.status(500).send({ message: "Lỗi khi lấy danh sách học sinh.", error: error.message });
        }
    },

    // [POST] /api/v1/students - Thêm học sinh mới
    async create(req, res) {
        const studentData = req.body;
        try {
            // Logic quan trọng: Kiểm tra sự tồn tại của các Khóa ngoại (Bus, Location, Parent)
            // Sequelize sẽ tự động kiểm tra nếu các ID này được truyền vào và không Null.
            const newStudent = await Student.create(studentData);
            res.status(201).send(newStudent);
        } catch (error) {
            // Lỗi có thể là: ID đã tồn tại, hoặc Khóa ngoại không hợp lệ (Bus ID, Location ID, Parent ID không có thật)
            res.status(400).send({ message: "Lỗi khi tạo học sinh mới. Kiểm tra các ID liên kết.", error: error.message });
        }
    },

    // [PUT] /api/v1/students/:id - Cập nhật thông tin học sinh
    async update(req, res) {
        const { id } = req.params;
        const updateData = req.body;
        try {
            const [updated] = await Student.update(updateData, {
                where: { id: id }
            });

            if (updated) {
                const updatedStudent = await Student.findByPk(id);
                res.send(updatedStudent);
            } else {
                res.status(404).send({ message: "Không tìm thấy học sinh." });
            }
        } catch (error) {
            res.status(500).send({ message: "Lỗi khi cập nhật học sinh.", error: error.message });
        }
    },

    // [DELETE] /api/v1/students/:id - Xóa học sinh
    async delete(req, res) {
        const { id } = req.params;
        try {
            const result = await Student.destroy({
                where: { id: id }
            });

            if (result) {
                // Sequelize sẽ xử lý: Các bản ghi trong Schedule_Student sẽ CASCADE DELETE
                res.status(200).send({ message: "Xóa học sinh thành công." });
            } else {
                res.status(404).send({ message: "Không tìm thấy học sinh." });
            }
        } catch (error) {
            res.status(500).send({ message: "Lỗi khi xóa học sinh.", error: error.message });
        }
    },
    // ... Thêm hàm findOne (Chi tiết) ...
};

module.exports = studentController;