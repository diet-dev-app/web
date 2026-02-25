import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
// Only redirect to /login on 401 if:
//   1. The failing request is NOT the login endpoint itself (avoids reload on bad credentials)
//   2. The user was previously authenticated (session-expiry scenario)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = (error.config?.url as string | undefined)?.includes('/api/login');
      const wasAuthenticated = !!localStorage.getItem('jwt_token');

      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');

      // Only hard-redirect for session expiry (not for a failed login attempt)
      if (!isLoginRequest && wasAuthenticated && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
