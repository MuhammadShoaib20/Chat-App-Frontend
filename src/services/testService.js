import api from './api';

export const checkHealth = async () => {
  try {
    const response = await api.get('/api/test/health'); // ✅ added /api
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};