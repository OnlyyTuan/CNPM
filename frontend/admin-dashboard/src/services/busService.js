// frontend/admin-dashboard/src/services/busService.js

import api from './apiService'; // Import instance API đã cấu hình baseURL 5000

const busService = {
    // GET /api/v1/buses
    async getAllBuses() {
        // Gọi API qua instance đã cấu hình base URL
        const response = await api.get('/buses'); 
        return response.data;
    },

    // POST /api/v1/buses
    async createBus(busData) {
        const response = await api.post('/buses', busData);
        return response.data;
    },
    
    // ... Thêm các hàm sửa, xóa, gán tuyến đường, ...
};

export default busService;