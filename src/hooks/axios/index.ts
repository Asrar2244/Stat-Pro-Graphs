import axios, { AxiosStatic } from 'axios';
import { logger } from '@utils';
const { VITE_API } = import.meta.env;
export const useAxios = (): AxiosStatic => {
  axios.defaults.baseURL = VITE_API;
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
  return axios;
};