import axios from 'axios';

// Get API URL from env or fallback to localhost during dev
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// Create a globally configured Axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for receiving and sending HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling (optional, but professional)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Global helper to instantly kill sessions securely
export const logoutSession = async () => {
  try {
    await apiClient.post('/auth/logout');
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
