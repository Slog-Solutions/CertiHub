import axios from 'axios';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5001/api';
    }
    
    // Production browser: Check if NEXT_PUBLIC_API_URL is set to a non-localhost URL
    const envUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
    if (envUrl && envUrl.trim() !== '') {
      const trimmed = envUrl.trim();
      if (!trimmed.includes('localhost') && !trimmed.includes('127.0.0.1')) {
        return trimmed.endsWith('/api') || trimmed === '/api' ? trimmed : `${trimmed.replace(/\/$/, '')}/api`;
      }
    }

    // Default for production browser: relative /api
    return '/api';
  }

  // Build time / Server Side evaluation
  const envUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim();
    if (!trimmed.includes('localhost') && !trimmed.includes('127.0.0.1')) {
      return trimmed.endsWith('/api') || trimmed === '/api' ? trimmed : `${trimmed.replace(/\/$/, '')}/api`;
    }
  }

  return 'http://localhost:5001/api';
};

// Export API_BASE_URL as string
export const API_BASE_URL = getApiBaseUrl();

// Set up Axios request interceptor to dynamically set correct API URL on every request
axios.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
}, (error) => Promise.reject(error));

export default getApiBaseUrl;



