export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  (typeof window !== 'undefined' && window.location.origin.includes('localhost') ? 'http://localhost:1111' : '') ||
  'http://localhost:1111';
