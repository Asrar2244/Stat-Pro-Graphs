// Sample size now uses the same queued task system as regression
export const getSampleSizeEndpoint = (_testType: string): string => {
  // All sample size tests use the same analysis endpoint like regression
  return `/api/analysis`; // Using direct string since API import might cause circular dependency
};

export const getLegacySampleSizeEndpoint = (): string => '';

export const makeApiRequest = () => {};

// Legacy direct HTTP call - kept for backward compatibility but not used
export const makeSampleSizeRequest = async (testType: string, formData: Record<string, any>): Promise<any> => {
  const endpoint = getSampleSizeEndpoint(testType);
  if (!endpoint) throw new Error('Unknown test type or endpoint not set');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};

export const getCurrentApiBaseUrl = (): string => '';
export const testApiConnectivity = (): Promise<boolean> => Promise.resolve(true); 