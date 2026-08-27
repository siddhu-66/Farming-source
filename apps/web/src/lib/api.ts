import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const authStorageStr = localStorage.getItem('auth-storage');
      if (authStorageStr) {
        const authStorage = JSON.parse(authStorageStr);
        const token = authStorage?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // auth-storage not initialized
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const authStorageStr = localStorage.getItem('auth-storage');
        if (authStorageStr) {
          const authStorage = JSON.parse(authStorageStr);
          const refreshToken = authStorage?.state?.refreshToken;
          if (refreshToken) {
            const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
            if (res.data.success) {
              const { accessToken, refreshToken: newRefreshToken } = res.data.data;
              authStorage.state.token = accessToken;
              authStorage.state.refreshToken = newRefreshToken;
              localStorage.setItem('auth-storage', JSON.stringify(authStorage));
              const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
              document.cookie = `token=${accessToken}; path=/; expires=${expires}; SameSite=Lax`;
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return axios(originalRequest);
            }
          }
        }
      } catch {
        // refresh failed
      }
    }
    return Promise.reject(error);
  }
);

export default api;
