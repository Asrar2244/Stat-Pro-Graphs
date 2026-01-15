import axios, { AxiosStatic } from 'axios';
import { logger } from '@utils';
const { VITE_API } = import.meta.env;

// Flag to track if interceptor has been registered
let interceptorRegistered = false;

export const useAxios = (): AxiosStatic => {
  axios.defaults.baseURL = VITE_API;

  // Only register interceptor once to avoid duplicate logs
  if (!interceptorRegistered) {
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
    interceptorRegistered = true;
  }

  return axios;
};