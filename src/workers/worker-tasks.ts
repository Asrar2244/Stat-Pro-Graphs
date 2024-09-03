import axiosApi from 'axios';

export const axios = async (url: string, parameters: any): Promise<any> => {
  const response = await axiosApi.post(url, parameters);
  return response.data;
};

export const stringToObject = (str: string) => {
  return JSON.parse(str);
};
