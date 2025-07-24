export const getSampleSizeEndpoint = (testType: string): string => {
  // Map test types to endpoints
  switch (testType) {
    case 'ttest-sample-size':
      return 'http://100.111.65.109:5000/sample_size/api/ttest-sample-size';
    case 'proportion-sample-size':
      return 'http://100.111.65.109:5000/sample_size/api/proportion-sample-size';
    case 'paired-ttest-sample-size':
      return 'http://100.111.65.109:5000/sample_size/api/paired-ttest-sample-size';
    case 'anova-sample-size':
      return 'http://100.111.65.109:5000/sample_size/api/anova-sample-size';
    case 'chi-square-sample-size':
      return 'http://100.111.65.109:5000/sample_size/api/chi-square-sample-size';
    default:
      return '';
  }
};

export const getLegacySampleSizeEndpoint = (): string => '';

export const makeApiRequest = () => {};

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