import { renderHook } from '@utils/test-utils';
import { useLicense } from './use-license';
import { useAxios } from '@hooks';

jest.mock('@hooks', () => ({
  useAxios: jest.fn(),
}));

describe('hooks/license/use-license', () => {
  let mockAxios: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxios = {
      post: jest.fn(),
    };

    (useAxios as jest.Mock).mockReturnValue(mockAxios);
  });

  describe('checkLicense', () => {
    it('should check license successfully', async () => {
      const mockResponse = {
        data: {
          valid: true,
          expiryDate: '2025-12-31',
          licenseType: 'premium',
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLicense());

      const licenseData = await result.current.checkLicense();

      expect(mockAxios.post).toHaveBeenCalledWith('api/receive-json', {
        operation: 'check_license',
      });

      expect(licenseData).toEqual(mockResponse.data);
    });

    it('should handle invalid license', async () => {
      const mockResponse = {
        data: {
          valid: false,
          error: 'License expired',
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLicense());

      const licenseData = await result.current.checkLicense();

      expect(licenseData.valid).toBe(false);
      expect(licenseData.error).toBe('License expired');
    });

    it('should handle network errors when checking license', async () => {
      mockAxios.post.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLicense());

      await expect(result.current.checkLicense()).rejects.toThrow('Network error');
    });

    it('should handle server errors when checking license', async () => {
      mockAxios.post.mockRejectedValue(new Error('Server error 500'));

      const { result } = renderHook(() => useLicense());

      await expect(result.current.checkLicense()).rejects.toThrow('Server error 500');
    });
  });

  describe('applyLicense', () => {
    it('should apply license successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'License applied successfully',
          licenseType: 'enterprise',
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLicense());

      const licenseKey = 'XXXX-YYYY-ZZZZ-AAAA';
      const response = await result.current.applyLicense({ license_key: licenseKey });

      expect(mockAxios.post).toHaveBeenCalledWith('api/receive-json', {
        license_key: licenseKey,
        operation: 'apply_license',
      });

      expect(response).toEqual(mockResponse.data);
      expect(response.success).toBe(true);
    });

    it('should handle invalid license key', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: 'Invalid license key',
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLicense());

      const response = await result.current.applyLicense({
        license_key: 'INVALID-KEY',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid license key');
    });

    it('should handle empty license key', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: 'License key is required',
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLicense());

      const response = await result.current.applyLicense({ license_key: '' });

      expect(mockAxios.post).toHaveBeenCalledWith('api/receive-json', {
        license_key: '',
        operation: 'apply_license',
      });

      expect(response.success).toBe(false);
    });

    it('should handle network errors when applying license', async () => {
      mockAxios.post.mockRejectedValue(new Error('Connection timeout'));

      const { result } = renderHook(() => useLicense());

      await expect(
        result.current.applyLicense({ license_key: 'TEST-KEY' }),
      ).rejects.toThrow('Connection timeout');
    });

    it('should handle license already applied scenario', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: 'License already applied',
          currentLicense: 'EXISTING-KEY',
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLicense());

      const response = await result.current.applyLicense({
        license_key: 'NEW-KEY',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('License already applied');
    });
  });

  describe('getSystemData', () => {
    it('should get system data successfully', async () => {
      const mockResponse = {
        data: {
          machineId: '12345-67890',
          platform: 'win32',
          version: '1.0.0',
          arch: 'x64',
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLicense());

      const systemData = await result.current.getSystemData();

      expect(mockAxios.post).toHaveBeenCalledWith('api/receive-json', {
        operation: 'get_system_data',
      });

      expect(systemData).toEqual(mockResponse.data);
      expect(systemData.machineId).toBe('12345-67890');
    });

    it('should handle missing system data', async () => {
      const mockResponse = {
        data: {
          error: 'Unable to retrieve system data',
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLicense());

      const systemData = await result.current.getSystemData();

      expect(systemData.error).toBe('Unable to retrieve system data');
    });

    it('should handle network errors when getting system data', async () => {
      mockAxios.post.mockRejectedValue(new Error('Network unavailable'));

      const { result } = renderHook(() => useLicense());

      await expect(result.current.getSystemData()).rejects.toThrow('Network unavailable');
    });

    it('should handle server errors when getting system data', async () => {
      mockAxios.post.mockRejectedValue(new Error('Internal server error'));

      const { result } = renderHook(() => useLicense());

      await expect(result.current.getSystemData()).rejects.toThrow('Internal server error');
    });

    it('should return system data with all expected fields', async () => {
      const mockResponse = {
        data: {
          machineId: 'ABC123',
          platform: 'darwin',
          version: '2.0.0',
          arch: 'arm64',
          memory: '16GB',
          cpus: 8,
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLicense());

      const systemData = await result.current.getSystemData();

      expect(systemData).toHaveProperty('machineId');
      expect(systemData).toHaveProperty('platform');
      expect(systemData).toHaveProperty('version');
      expect(systemData).toHaveProperty('arch');
      expect(systemData.cpus).toBe(8);
    });
  });

  describe('combined workflow', () => {
    it('should check license, then apply if needed, then get system data', async () => {
      const { result } = renderHook(() => useLicense());

      // First check license - not valid
      mockAxios.post.mockResolvedValueOnce({
        data: { valid: false },
      });

      const checkResult = await result.current.checkLicense();
      expect(checkResult.valid).toBe(false);

      // Apply license
      mockAxios.post.mockResolvedValueOnce({
        data: { success: true },
      });

      const applyResult = await result.current.applyLicense({
        license_key: 'NEW-KEY',
      });
      expect(applyResult.success).toBe(true);

      // Get system data
      mockAxios.post.mockResolvedValueOnce({
        data: { machineId: 'ABC' },
      });

      const systemData = await result.current.getSystemData();
      expect(systemData.machineId).toBe('ABC');

      expect(mockAxios.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    it('should handle null response data', async () => {
      mockAxios.post.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useLicense());

      const data = await result.current.checkLicense();
      expect(data).toBeNull();
    });

    it('should handle undefined response data', async () => {
      mockAxios.post.mockResolvedValue({});

      const { result } = renderHook(() => useLicense());

      const data = await result.current.checkLicense();
      expect(data).toBeUndefined();
    });

    it('should handle response with extra fields', async () => {
      mockAxios.post.mockResolvedValue({
        data: {
          valid: true,
          extra: 'field',
          nested: { data: 'value' },
        },
      });

      const { result } = renderHook(() => useLicense());

      const data = await result.current.checkLicense();
      expect(data.valid).toBe(true);
      expect(data.extra).toBe('field');
      expect(data.nested).toEqual({ data: 'value' });
    });
  });
});
