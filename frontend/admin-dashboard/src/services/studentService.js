// frontend/admin-dashboard/src/services/studentService.js

import api from './apiService'; 

const studentService = {
    // 1. Lấy tất cả Học sinh
    getAllStudents: async () => {
        const response = await api.get('/students');
        return response.data;
    },
    // 2. Thêm Học sinh mới
    createStudent: async (studentData) => {
        const response = await api.post('/students', studentData);
        return response.data;
    },
    // 3. Lấy dữ liệu cần thiết cho Dropdown (sẽ tạo API này trong Backend sau)
    // Ví dụ: Lấy danh sách điểm đón/trả
    getAllLocations: async () => {
        // API này cần được thêm vào Backend: /api/v1/locations
        const response = await api.get('/locations'); 
        return response.data;
    },
    // ... Thêm các hàm CRUD khác ...
};

export default studentService;