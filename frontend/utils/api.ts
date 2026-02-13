const getDefaultBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }

  const protocol = window.location.protocol || 'http:';
  const host = window.location.hostname || 'localhost';
  const port = import.meta.env.VITE_API_PORT || '5000';

  return `${protocol}//${host}:${port}/api`;
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultBaseUrl();
