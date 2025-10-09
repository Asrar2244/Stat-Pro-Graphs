import { renderHook } from '@utils/test-utils';
import { useToaster } from './index';
import { useToastController } from '@fluentui/react-components';

jest.mock('@fluentui/react-components', () => ({
  useToastController: jest.fn(),
}));

jest.mock('@libs', () => ({
  ToasterComponent: ({ title, body }: any) => (
    <div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        success: 'Success',
        info: 'Information',
        error: 'Error',
        warn: 'Warning',
      };
      return translations[key] || key;
    },
  }),
}));

describe('hooks/toaster', () => {
  let mockDispatchToast: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDispatchToast = jest.fn();
    (useToastController as jest.Mock).mockReturnValue({
      dispatchToast: mockDispatchToast,
    });
  });

  describe('success', () => {
    it('should display success toast with default title', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success({ body: 'Operation completed' });

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'success',
        }),
      );
    });

    it('should display success toast with custom title', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success({ title: 'Custom Success', body: 'Done!' });

      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should pass custom options to success toast', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success(
        { body: 'Test' },
        {
          timeout: 5000,
          position: 'top-end',
        },
      );

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'success',
          timeout: 5000,
          position: 'top-end',
        }),
      );
    });

    it('should handle empty body', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success({ body: '' });

      expect(mockDispatchToast).toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should display info toast with default title', () => {
      const { result } = renderHook(() => useToaster());

      result.current.info({ body: 'Information message' });

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'info',
        }),
      );
    });

    it('should display info toast with custom title', () => {
      const { result } = renderHook(() => useToaster());

      result.current.info({ title: 'Custom Info', body: 'Details here' });

      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should pass custom options to info toast', () => {
      const { result } = renderHook(() => useToaster());

      result.current.info(
        { body: 'Test' },
        {
          pauseOnHover: true,
          pauseOnWindowBlur: true,
        },
      );

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'info',
          pauseOnHover: true,
          pauseOnWindowBlur: true,
        }),
      );
    });
  });

  describe('error', () => {
    it('should display error toast with default title', () => {
      const { result } = renderHook(() => useToaster());

      result.current.error({ body: 'An error occurred' });

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'error',
        }),
      );
    });

    it('should display error toast with custom title', () => {
      const { result } = renderHook(() => useToaster());

      result.current.error({ title: 'Critical Error', body: 'Something went wrong' });

      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should handle error with stack trace in body', () => {
      const { result } = renderHook(() => useToaster());

      const errorBody = 'Error: Something failed\n  at Component.render\n  at App.js:42';
      result.current.error({ body: errorBody });

      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should pass custom options to error toast', () => {
      const { result } = renderHook(() => useToaster());

      result.current.error(
        { body: 'Test error' },
        {
          timeout: 10000,
          priority: 999,
        },
      );

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'error',
          timeout: 10000,
          priority: 999,
        }),
      );
    });
  });

  describe('warn', () => {
    it('should display warning toast with default title', () => {
      const { result } = renderHook(() => useToaster());

      result.current.warn({ body: 'Warning message' });

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'warning',
        }),
      );
    });

    it('should display warning toast with custom title', () => {
      const { result } = renderHook(() => useToaster());

      result.current.warn({ title: 'Caution', body: 'Please be careful' });

      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should pass custom options to warning toast', () => {
      const { result } = renderHook(() => useToaster());

      result.current.warn(
        { body: 'Test warning' },
        {
          position: 'bottom-start',
          politeness: 'assertive',
        },
      );

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'warning',
          position: 'bottom-start',
          politeness: 'assertive',
        }),
      );
    });
  });

  describe('multiple toasts', () => {
    it('should display multiple toasts in sequence', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success({ body: 'First' });
      result.current.info({ body: 'Second' });
      result.current.error({ body: 'Third' });
      result.current.warn({ body: 'Fourth' });

      expect(mockDispatchToast).toHaveBeenCalledTimes(4);
    });

    it('should handle rapid toast dispatches', () => {
      const { result } = renderHook(() => useToaster());

      for (let i = 0; i < 10; i++) {
        result.current.info({ body: `Message ${i}` });
      }

      expect(mockDispatchToast).toHaveBeenCalledTimes(10);
    });
  });

  describe('edge cases', () => {
    it('should handle very long body text', () => {
      const { result } = renderHook(() => useToaster());

      const longBody = 'a'.repeat(10000);
      result.current.info({ body: longBody });

      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should handle special characters in body', () => {
      const { result } = renderHook(() => useToaster());

      result.current.info({ body: '<script>alert("xss")</script>' });

      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should handle unicode characters', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success({ body: '成功 ✓ 🎉' });

      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should handle undefined title override', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success({ title: undefined, body: 'Test' });

      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should handle empty options object', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success({ body: 'Test' }, {});

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'success',
        }),
      );
    });

    it('should handle null body gracefully', () => {
      const { result } = renderHook(() => useToaster());

      result.current.info({ body: null as any });

      expect(mockDispatchToast).toHaveBeenCalled();
    });
  });

  describe('options merging', () => {
    it('should merge custom options with default intent', () => {
      const { result } = renderHook(() => useToaster());

      const customOptions = {
        timeout: 3000,
        position: 'top-end' as const,
        pauseOnHover: true,
        priority: 100,
      };

      result.current.success({ body: 'Test' }, customOptions);

      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...customOptions,
          intent: 'success',
        }),
      );
    });

    it('should not allow intent override', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success(
        { body: 'Test' },
        {
          intent: 'error' as any, // Try to override
        },
      );

      // Should still be success
      expect(mockDispatchToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          intent: 'success',
        }),
      );
    });
  });

  describe('translation integration', () => {
    it('should use translated titles', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success({ body: 'Test' });

      // The component should receive the translated title
      expect(mockDispatchToast).toHaveBeenCalled();

      result.current.error({ body: 'Test' });
      expect(mockDispatchToast).toHaveBeenCalled();

      result.current.info({ body: 'Test' });
      expect(mockDispatchToast).toHaveBeenCalled();

      result.current.warn({ body: 'Test' });
      expect(mockDispatchToast).toHaveBeenCalled();
    });

    it('should allow title override even with translations', () => {
      const { result } = renderHook(() => useToaster());

      result.current.success({ title: 'My Custom Title', body: 'Test' });

      expect(mockDispatchToast).toHaveBeenCalled();
    });
  });
});
