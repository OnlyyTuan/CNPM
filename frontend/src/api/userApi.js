// frontend/src/api/userApi.js
import axiosClient from './axiosClient';

export const getChatUsers = async () => {
  try {
    const response = await axiosClient.get('/users/chat-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat users:', error);
    throw error;
  }
};
