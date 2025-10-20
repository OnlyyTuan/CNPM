// backend/src/services/parentService.js

const { Parent, Student, User, Bus, Location } = require('../db'); 
const { sequelize } = require('../db'); 

const parentService = {
    // 1. Lấy danh sách Phụ huynh kèm danh sách Học sinh
    async getAllParentsWithStudents() {
        return Parent.findAll({
            include: [{ 
                model: Student, 
                as: 'Students', 
                required: false 
            }],
            order: [['fullName', 'ASC']] 
        });
    },

    // 2. Lấy chi tiết Học sinh kèm tất cả thông tin liên quan (Bus, Locations, Parent)
    async getStudentDetail(studentId) {
        return Student.findByPk(studentId, {
            include: [
                { model: Parent, as: 'Parent', attributes: ['id', 'fullName', 'phone'] },
                { model: Bus, as: 'AssignedBus', attributes: ['id', 'license_plate'] },
                { model: Location, as: 'PickupLocation' },
                { model: Location, as: 'DropoffLocation' },
            ]
        });
    },

    // 3. Nghiệp vụ phức tạp: Tạo Tài khoản User, Phụ huynh, và Học sinh trong 1 Transaction
    async createParentAndStudent(userData, parentData, studentData) {
        const t = await sequelize.transaction();
        try {
            // Bước 1: Tạo User
            const newUser = await User.create({...userData, role: 'parent'}, { transaction: t });
            
            // Bước 2: Tạo Parent
            const newParent = await Parent.create({
                ...parentData,
                userId: newUser.id 
            }, { transaction: t });
            
            // Bước 3: Tạo Student
            const newStudent = await Student.create({
                ...studentData,
                parentId: newParent.id 
            }, { transaction: t });

            await t.commit();
            return { parent: newParent, student: newStudent, user: newUser };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },
    
    // Thêm hàm lấy Parent theo ID nếu cần
    async getParentById(id) {
        return Parent.findByPk(id, {
            include: [{ 
                model: Student, 
                as: 'Students', 
                required: false 
            }]
        });
    }
};

module.exports = parentService;