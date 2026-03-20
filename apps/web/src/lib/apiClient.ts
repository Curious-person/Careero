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
    // 1. Tell the Express backend to register the logout event
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Backend logout failed:', error);
  } finally {
    try {
      // 2. Ironclad Next.js native cookie destruction
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      console.error('Local logout failed:', e);
    }
    // 3. Absolute forced redirect bypassing router cache
    window.location.replace('/login');
  }
};
