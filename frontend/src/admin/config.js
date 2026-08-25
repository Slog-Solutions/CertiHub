const rawUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '';
const baseUrl = (rawUrl && rawUrl !== '/api') ? rawUrl : 'http://localhost:5001';

export const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
