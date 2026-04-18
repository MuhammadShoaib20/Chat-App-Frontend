import api from './api';

export const searchUsers = async (query) => {
  const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`); // ✅ added /api
  return response.data;
};

export const getBlockStatus = async (userId) => {
  const response = await api.get(`/api/users/block-status/${userId}`); // ✅ added /api
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await api.post(`/api/users/block/${userId}`); // ✅ added /api
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await api.post(`/api/users/unblock/${userId}`); // ✅ added /api
  return response.data;
};