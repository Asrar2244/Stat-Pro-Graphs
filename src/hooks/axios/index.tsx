import axios, { AxiosStatic } from 'axios';
import { logger } from '@utils';
const { VITE_API } = import.meta.env;
export const useAxios = (): AxiosStatic => {
  axios.defaults.baseURL = VITE_API || 'http://localhost:5000';
  axios.defaults.timeout = 10000; // 10 second timeout
  axios.interceptors.request.use(
    (config) => {
      logger.info({ message: 'Request Sent--', body: config.data });
      return config;
    },
    (error) => {
      logger.error({ error: error.message });
      return Promise.reject(error);
    },
  );
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.code === 'ECONNABORTED') {
        logger.error({ error: 'Request timeout - backend may be unreachable' });
      } else {
        logger.error({ error: error.message });
      }
      return Promise.reject(error);
    },
  );
  return axios;
}; 