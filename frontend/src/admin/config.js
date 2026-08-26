const getApiBaseUrl = () => {
  const envUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;

  // 1. If NEXT_PUBLIC_API_URL is explicitly defined
  if (envUrl !== undefined && envUrl !== '') {
    return envUrl.endsWith('/api') || envUrl === '/api' ? envUrl : `${envUrl}/api`;
  }

  // 2. If running in browser on production domain (e.g. smp.slogsolutions.com), use relative /api for Nginx reverse proxy
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }

  // 3. Default fallback for local development
  return 'http://localhost:5001/api';
};

export const API_BASE_URL = getApiBaseUrl();
