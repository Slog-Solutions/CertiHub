import axios from 'axios';

export const getApiBaseUrl = () => {
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  // 1. Check NEXT_PUBLIC_API_URL environment variable if provided
  const envUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/$/, '');
    if (!isLocal || !trimmed.includes('localhost')) {
      return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    }
  }

  // 2. Local development fallback
  if (isLocal) {
    return 'http://localhost:5001/api';
  }

  // 3. Production browser fallback: relative /api
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Axios request interceptor: dynamically resolves baseURL and prevents duplicate '/api/api' paths
axios.interceptors.request.use((config) => {
  const baseUrl = getApiBaseUrl(); // e.g. 'http://localhost:5001/api' or '/api'

  if (config.url) {
    // If config.url starts with http:// or https://, do not modify baseURL
    if (config.url.startsWith('http://') || config.url.startsWith('https://')) {
      config.baseURL = '';
    } else if (config.url.startsWith('/api/') && baseUrl.endsWith('/api')) {
      // Strip trailing '/api' from baseURL so '/api' + '/api/users' doesn't produce '/api/api/users'
      config.baseURL = baseUrl.slice(0, -4);
    } else {
      config.baseURL = baseUrl;
    }

    // Clean up any accidental double /api/api/ in config.url
    if (config.url.startsWith('/api/api/')) {
      config.url = config.url.replace(/^\/api\/api\//, '/api/');
    }
  } else {
    config.baseURL = baseUrl;
  }

  return config;
}, (error) => Promise.reject(error));

export default getApiBaseUrl;




