import React from 'react';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Xin chào, {user.fullName || user.username}</h1>
      <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <p className="text-gray-600">Chào mừng bạn đến với cổng thông tin phụ huynh.</p>
        <p className="mt-2">Vui lòng chọn "Thông báo" để xem các cập nhật mới nhất về việc đưa đón con em.</p>
      </div>
    </div>
  );
};

export default Dashboard;
