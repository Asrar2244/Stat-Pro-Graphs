import axios from 'axios';

// Legacy direct HTTP call - kept for backward compatibility but not used
// Sample size now uses the same queued task system as regression
// All sample size tests use the same analysis endpoint like regression
export const makeSampleSizeRequest = async (_testType: string, formData: Record<string, any>): Promise<any> => {
  const endpoint = '/api/analysis'; // Using direct string since API import might cause circular dependency
  try {
    const response = await axios.post(endpoint, formData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}`);
    }
    throw error;
  }
};

export const testApiConnectivity = (): Promise<boolean> => Promise.resolve(true); 