import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('campuspulse_token'));
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('campuspulse_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res?.data?.user) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('campuspulse_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('campuspulse_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('campuspulse_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer',
    isStudent: user?.role === 'student',
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
