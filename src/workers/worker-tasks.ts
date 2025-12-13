import axiosApi from 'axios';

// Set up response interceptor to catch any response errors
axiosApi.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const { status, statusText, data } = error.response;
      const errorMessage = data?.error || data?.message || statusText || `Request failed with status ${status}`;
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('No response received from server. Please check your network connection.'));
    } else {
      // Error setting up the request
      return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
    }
  }
);

export const axios = async (url: string, parameters: any): Promise<any> => {
  const response = await axiosApi.post(url, parameters);
  return {
    data: response.data,
    status: response.status,
    statusText: response.statusText,
  };
};

export const stringToObject = (str: string) => {
  return JSON.parse(str);
};
