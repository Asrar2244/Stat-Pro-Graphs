import axios, { AxiosStatic } from 'axios';
const { MODE, VITE_API } = import.meta.env;
export const useAxios = (): AxiosStatic => {
  axios.defaults.baseURL = VITE_API;
  if (MODE === 'development') {
    axios.defaults.headers.common['x-mock-match-request-body'] = 'false';
  }
  return axios;
};
