// frontend/admin-dashboard/src/services/driverService.js

import api from './apiService'; // Import instance Axios đã cấu hình

const driverService = {
    // 1. Lấy tất cả Tài xế (GET /api/v1/drivers)
    getAllDrivers: async () => {
        try {
            const response = await api.get('/drivers');
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tài xế:", error);
            throw error;
        }
    },

    // 2. Thêm Tài xế mới (POST /api/v1/drivers)
    createDriver: async (driverData, userData) => {
        try {
            // Backend Controller cần nhận cả userData (cho bảng User) và driverData (cho bảng Driver)
            const response = await api.post('/drivers', { driverData, userData });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo tài xế:", error);
            throw error;
        }
    },

    // 3. Gán Xe buýt cho Tài xế (PUT /api/v1/drivers/:id/assign-bus)
    assignBus: async (driverId, busId) => {
        try {
            const response = await api.put(`/drivers/${driverId}/assign-bus`, { busId });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi gán xe cho tài xế ${driverId}:`, error);
            throw error;
        }
    },
    
    // ... Thêm updateDriver, deleteDriver sau ...
};

export default driverService;