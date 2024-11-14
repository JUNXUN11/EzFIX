
import axios from 'axios';
import { authService } from './services/authService';

const axiosInstance = axios.create({
  baseURL: 'https://theezfixapi.onrender.com/api/v1'
});

axiosInstance.interceptors.request.use(
  (config) => {
    const headers = authService.getAuthHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;