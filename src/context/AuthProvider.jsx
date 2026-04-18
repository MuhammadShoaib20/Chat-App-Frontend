import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { requestNotificationPermission } from '../services/notificationService';
import api from '../services/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/users/profile');
          if (isMounted) setUser(response.data);
        } catch {
          if (isMounted) localStorage.removeItem('token'); // Clear invalid token
        }
      }
      // Always set loading to false after check (whether token existed or not)
      if (isMounted) setLoading(false);
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    requestNotificationPermission();
    return userData;
  };

  const register = async (username, email, password, avatar = '') => {
    const response = await api.post('/api/auth/register', { username, email, password, avatar });
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    // requestNotificationPermission(); // Disabled for now
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    if (user) {
      // requestNotificationPermission(); // Disabled for now
    }
  }, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};