import React, { useEffect, useState } from 'react';
import notificationApi from '../api/notificationApi';
import { Bell } from 'lucide-react'; // Remove Check icon
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      // setLoading(true); // Don't toggle loading on polling to avoid flicker
      const res = await notificationApi.getMyNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Thông báo</h2>
        {/* Removed Mark all as read button */}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading && notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
        ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Bell className="w-12 h-12 text-gray-300 mb-2" />
                <p>Chưa có thông báo nào.</p>
            </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id} className={`hover:bg-gray-50 transition-colors`}>
                <div className="px-4 py-4 sm:px-6 flex items-start">
                    <div className="flex-shrink-0 mr-4">
                        <div className={`p-2 rounded-full bg-pink-100 text-pink-600`}>
                            <Bell className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <h3 className={`text-sm font-medium text-gray-900`}>
                                {notification.title}
                            </h3>
                            <span className="text-xs text-gray-500">
                                {format(new Date(notification.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                        {/* Removed individual Mark as read button */}
                    </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
