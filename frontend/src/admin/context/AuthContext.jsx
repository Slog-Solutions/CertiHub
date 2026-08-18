import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('token') || null) : null);
  const [loading, setLoading] = useState(true);

  // Stable Axios instance: only recreated (with a fresh interceptor) when the
  // token actually changes, instead of on every render.
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: `${API_BASE_URL}` });
    instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    return instance;
  }, [token]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/profile');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user profile:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Authentication failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
