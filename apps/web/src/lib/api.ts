import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Access tokens are intentionally not read from localStorage or written to document.cookie.
// Authentication is carried by the server-managed HttpOnly cookie.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        if (res.data?.success) return api(originalRequest);
      } catch {
        // Refresh failed; let the original 401 propagate to the caller.
      }
    }
    return Promise.reject(error);
  }
);

export default api;
