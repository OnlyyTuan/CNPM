const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
            username: 'admin1',
            password: '123456'
        });
        console.log('Đăng nhập thành công:', response.data);
    } catch (error) {
        console.error('Lỗi đăng nhập:', error.response ? error.response.data : error.message);
    }
}

testLogin();