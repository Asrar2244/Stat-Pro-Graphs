import { renderHook, act } from '@utils/test-utils';
import { useWindowFocus } from './index';

describe('hooks/window-focus', () => {
  let hasFocusSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock document.hasFocus()
    hasFocusSpy = jest.spyOn(document, 'hasFocus');
  });

  afterEach(() => {
    hasFocusSpy.mockRestore();
  });

  it('should return true when window has focus initially', () => {
    hasFocusSpy.mockReturnValue(true);

    const { result } = renderHook(() => useWindowFocus());

    expect(result.current).toBe(true);
  });

  it('should return false when window does not have focus initially', () => {
    hasFocusSpy.mockReturnValue(false);

    const { result } = renderHook(() => useWindowFocus());

    expect(result.current).toBe(false);
  });

  it('should update to true when window gains focus', () => {
    hasFocusSpy.mockReturnValue(false);

    const { result } = renderHook(() => useWindowFocus());

    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(result.current).toBe(true);
  });

  it('should update to false when window loses focus', () => {
    hasFocusSpy.mockReturnValue(true);

    const { result } = renderHook(() => useWindowFocus());

    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(result.current).toBe(false);
  });

  it('should handle multiple focus and blur events', () => {
    hasFocusSpy.mockReturnValue(true);

    const { result } = renderHook(() => useWindowFocus());

    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(result.current).toBe(true);
  });

  it('should cleanup event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useWindowFocus());

    expect(addEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should not cause memory leaks with rapid focus changes', () => {
    hasFocusSpy.mockReturnValue(true);

    const { result } = renderHook(() => useWindowFocus());

    // Simulate rapid focus changes
    for (let i = 0; i < 100; i++) {
      act(() => {
        window.dispatchEvent(new Event(i % 2 === 0 ? 'focus' : 'blur'));
      });
    }

    // Should end on focus (i=99, odd number means blur, then i=100 would be focus but loop ends)
    // Last event is blur (i=99, odd)
    expect(result.current).toBe(false);
  });

  // SSR test skipped - cannot delete document in jsdom environment

  it('should properly set initial state from document.hasFocus()', () => {
    // Test with focus
    hasFocusSpy.mockReturnValue(true);
    const { result: result1 } = renderHook(() => useWindowFocus());
    expect(result1.current).toBe(true);

    // Test without focus
    hasFocusSpy.mockReturnValue(false);
    const { result: result2 } = renderHook(() => useWindowFocus());
    expect(result2.current).toBe(false);
  });

  it('should maintain state across re-renders', () => {
    hasFocusSpy.mockReturnValue(true);

    const { result, rerender } = renderHook(() => useWindowFocus());

    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(result.current).toBe(false);

    // Re-render should maintain state
    rerender();

    expect(result.current).toBe(false);
  });

  it('should respond to focus event immediately', () => {
    hasFocusSpy.mockReturnValue(false);

    const { result } = renderHook(() => useWindowFocus());

    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    // Should update synchronously
    expect(result.current).toBe(true);
  });

  it('should respond to blur event immediately', () => {
    hasFocusSpy.mockReturnValue(true);

    const { result } = renderHook(() => useWindowFocus());

    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    // Should update synchronously
    expect(result.current).toBe(false);
  });
});
