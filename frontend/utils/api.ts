const PROD_BACKEND_BASE = 'https://isl-web-app-2-uxja.onrender.com/api';

const getDefaultBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }

  const protocol = window.location.protocol || 'http:';
  const host = window.location.hostname || 'localhost';
  const port = import.meta.env.VITE_API_PORT || '5000';

  if (host === 'localhost' || host === '127.0.0.1') {
    return `${protocol}//${host}:${port}/api`;
  }

  return PROD_BACKEND_BASE;
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultBaseUrl();
