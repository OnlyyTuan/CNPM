// frontend/src/api/messageApi.js
import axiosClient from './axiosClient';

export const getChatHistory = async (otherUserId) => {
  try {
    const response = await axiosClient.get(`/messages/history/${otherUserId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

export const getFirstAdmin = async () => {
  try {
    const response = await axiosClient.get('/users/admin');
    return response.data;
  } catch (error) {
    console.error('Error fetching first admin:', error);
    throw error;
  }
}