import api from './api';

export const getMessages = async (conversationId, page = 1) => {
  const response = await api.get(`/api/messages/conversations/${conversationId}?page=${page}`);
  return response.data;
};

export const sendMessage = async (data) => {
  const response = await api.post('/api/messages', data);
  return response.data;
};

export const markAsRead = async ({ conversationId, messageIds }) => {
  const response = await api.post('/api/messages/read', { conversationId, messageIds });
  return response.data;
};

export const searchMessages = async ({ conversationId, q }) => {
  const response = await api.get(`/api/messages/search?conversationId=${conversationId}&q=${encodeURIComponent(q)}`);
  return response.data;
};