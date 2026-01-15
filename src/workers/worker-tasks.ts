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

// Database Worker Tasks
// CRITICAL: Database operations removed from Worker because Tauri IPC relies on window object
// which is not available in Web Workers.
// Hybrid Approach:
// 1. Main Thread fetches raw data from SQLite
// 2. Worker processes/formats the data (heavy CPU task)
export const processDbData = async (result: any[]): Promise<any> => {
  if (!result || !Array.isArray(result) || result.length === 0) return [];

  // 4. Format Data (The Heavy CPU Task)
  // Extract column names from first row
  const allColumns = Object.keys(result[0] || {});
  const columns = allColumns.filter((col: string) => col !== 'xxx_start_pro_id');

  if (columns.length === 0) return [];

  // Check for default headers
  const isDefaultHeaders = columns.every(col => {
    return /^[A-Z]+$/.test(col) ||
      /^Column[_\s]+[A-Z]+$/i.test(col) ||
      /^col(umn)?_?\d+$/i.test(col) ||
      /^field_?\d+$/i.test(col);
  });

  const excelData = isDefaultHeaders
    ? [
      ...result.map((row: any) =>
        columns.map((col: string) => String(row[col] || ''))
      )
    ]
    : [
      columns,
      ...result.map((row: any) =>
        columns.map((col: string) => String(row[col] || ''))
      )
    ];

  return excelData;
};
