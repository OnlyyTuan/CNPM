// frontend/admin-dashboard/src/services/apiService.js

import axios from 'axios';

// GIÁ TRỊ PHẢI LÀ 5000
const API_BASE_URL = 'http://localhost:5000/api/v1'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;