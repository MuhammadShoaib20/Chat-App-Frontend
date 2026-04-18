import api from './api';

export const getConversations = async () => {
  const response = await api.get('/api/conversations');   // ✅ must have /api
  return response.data;
};

export const getConversation = async (id) => {
  const response = await api.get(`/api/conversations/${id}`); // ✅ added /api
  return response.data;
};

export const createConversation = async (data) => {
  const response = await api.post('/api/conversations', data); // ✅ added /api
  return response.data;
};

export const addParticipants = async (conversationId, userIds) => {
  const response = await api.post(`/api/conversations/${conversationId}/participants`, { userIds }); // ✅ added /api
  return response.data;
};

export const hideConversation = async (conversationId) => {
  const response = await api.post(`/api/conversations/${conversationId}/hide`); // ✅ added /api
  return response.data;
};