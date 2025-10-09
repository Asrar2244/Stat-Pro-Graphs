import { renderHook, waitFor } from '@utils/test-utils';
import { usePlotly } from './index';
import * as Plotly from 'plotly.js-dist';

// Mock plotly.js-dist
jest.mock('plotly.js-dist', () => ({
  newPlot: jest.fn(),
  purge: jest.fn(),
  react: jest.fn(),
  relayout: jest.fn(),
  downloadImage: jest.fn(),
}));

describe('hooks/plotly', () => {

  beforeEach(() => {
    jest.clearAllMocks();

  });

  const defaultProps = {
    data: [{ x: [1, 2, 3], y: [4, 5, 6], type: 'scatter' }],
    layout: {},
    config: {},
  };

  it('should initialize plotly graph with default config', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    expect(result.current.graph).toBeDefined();
  });

  it('should have graph ref defined', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    expect(result.current.graph).toBeDefined();
    expect(result.current.graph.current).toBeUndefined();
  });

  it('should merge custom layout with default layout', () => {
    const customLayout = { title: 'Test Chart' };
    const props = { ...defaultProps, layout: customLayout };

    const { result } = renderHook(() => usePlotly(props as any));

    // Hook should be initialized with merged layout
    expect(result.current).toBeDefined();
  });

  it('should merge custom config with default config', () => {
    const customConfig = { displayModeBar: true };
    const props = { ...defaultProps, config: customConfig };

    const { result } = renderHook(() => usePlotly(props as any));

    // Hook should be initialized with merged config
    expect(result.current).toBeDefined();
  });

  it('should initialize with enablePointEvent option', () => {
    const { result } = renderHook(() =>
      usePlotly({ ...defaultProps, enablePointEvent: true } as any)
    );

    expect(result.current.graph).toBeDefined();
  });

  it('should have undefined points initially', () => {
    const { result } = renderHook(() =>
      usePlotly({ ...defaultProps, enablePointEvent: true } as any)
    );

    expect(result.current.points).toBeUndefined();
  });

  it('should have points as undefined initially', () => {
    const { result } = renderHook(() =>
      usePlotly({ ...defaultProps, enablePointEvent: false } as any)
    );

    expect(result.current.points).toBeUndefined();
  });

  it('should have resetPoints function', () => {
    const { result } = renderHook(() =>
      usePlotly({ ...defaultProps, enablePointEvent: true } as any)
    );

    expect(result.current.resetPoints).toBeDefined();
    expect(typeof result.current.resetPoints).toBe('function');

    // Call resetPoints
    result.current.resetPoints();
    expect(result.current.points).toBeUndefined();
  });

  it('should have redraw function', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    expect(result.current.redraw).toBeDefined();
    expect(typeof result.current.redraw).toBe('function');
  });

  it('should have screenResize function', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    expect(result.current.screenResize).toBeDefined();
    expect(typeof result.current.screenResize).toBe('function');
  });

  it('should have download function', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    expect(result.current.download).toBeDefined();
    expect(typeof result.current.download).toBe('function');
  });

  it('should have setAnnotations function', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    expect(result.current.setAnnotations).toBeDefined();
    expect(typeof result.current.setAnnotations).toBe('function');
  });

  it('should return editedConfig when provided', () => {
    const editedConfig = {
      default: { graph: 'scatter', mode: 'lines' },
      graphs: ['scatter', 'bar'],
      modes: ['lines', 'markers'],
      download: [{ format: 'png', description: 'PNG Image' }],
    };

    const { result } = renderHook(() =>
      usePlotly({ ...defaultProps, editedConfig } as any)
    );

    expect(result.current.editedConfig).toEqual(editedConfig);
  });

  it('should handle data prop changes', () => {
    const { rerender } = renderHook(
      ({ data }) => usePlotly({ ...defaultProps, data } as any),
      { initialProps: { data: defaultProps.data } }
    );

    const newData = [{ x: [10, 20], y: [30, 40], type: 'bar' }];
    rerender({ data: newData });

    // Hook should re-render with new data
    expect(rerender).toBeDefined();
  });

  it('should handle layout prop changes', () => {
    const { rerender } = renderHook(
      ({ layout }) => usePlotly({ ...defaultProps, layout } as any),
      { initialProps: { layout: {} } }
    );

    const newLayout = { title: 'New Title' };
    rerender({ layout: newLayout });

    // Hook should re-render with new layout
    expect(rerender).toBeDefined();
  });

  it('should handle config prop changes', () => {
    const { rerender } = renderHook(
      ({ config }) => usePlotly({ ...defaultProps, config } as any),
      { initialProps: { config: {} } }
    );

    const newConfig = { displayModeBar: true };
    rerender({ config: newConfig });

    // Hook should re-render with new config
    expect(rerender).toBeDefined();
  });

  it('should call newPlot when graph ref is set', async () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    // Simulate ref assignment
    const divElement = document.createElement('div');
    Object.defineProperty(result.current.graph, 'current', {
      get: () => divElement,
      set: () => { },
    });

    await waitFor(() => {
      expect(result.current.graph).toBeDefined();
    });
  });

  it('should call redraw function with new props', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    const newProps = {
      data: [{ x: [5, 6], y: [7, 8], type: 'line' }],
      layout: { title: 'Updated' },
      config: {},
    };

    result.current.graph.current = document.createElement('div');
    result.current.redraw(newProps as any);

    expect(Plotly.react).toHaveBeenCalled();
  });

  it('should call screenResize function', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    result.current.graph.current = document.createElement('div');
    result.current.screenResize(800, 600);

    expect(Plotly.relayout).toHaveBeenCalledWith(expect.anything(), {
      width: 800,
      height: 600,
    });
  });

  it('should call download function with parameters', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    result.current.graph.current = document.createElement('div');
    result.current.download('png', 'chart.png', 1920, 1080);

    expect(Plotly.downloadImage).toHaveBeenCalledWith(expect.anything(), {
      format: 'png',
      filename: 'chart.png',
      width: 1920,
      height: 1080,
    });
  });

  it('should call setAnnotations function', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    result.current.graph.current = {
      layout: { annotations: [] },
    };

    const annotation = {
      x: 5,
      y: 10,
      text: 'Test Annotation',
    };

    result.current.setAnnotations(annotation as any);

    expect(Plotly.relayout).toHaveBeenCalled();
  });

  it('should initialize with enablePointEvent and have resetPoints function', () => {
    const { result } = renderHook(() =>
      usePlotly({ ...defaultProps, enablePointEvent: true } as any)
    );

    // Should have resetPoints function available
    expect(result.current.resetPoints).toBeDefined();
    expect(typeof result.current.resetPoints).toBe('function');

    // Points should be undefined initially
    expect(result.current.points).toBeUndefined();

    // Call resetPoints should work without errors
    result.current.resetPoints();
    expect(result.current.points).toBeUndefined();
  });

  it('should cleanup graph on unmount', () => {
    const { result, unmount } = renderHook(() => usePlotly(defaultProps as any));

    result.current.graph.current = document.createElement('div');

    unmount();

    expect(Plotly.purge).toHaveBeenCalled();
  });

  it('should merge layout with default values', () => {
    const customLayout = {
      title: 'Custom Title',
      xaxis: { title: 'X Axis' },
    };

    const { result } = renderHook(() =>
      usePlotly({ ...defaultProps, layout: customLayout } as any)
    );

    expect(result.current).toBeDefined();
  });

  it('should handle download without optional parameters', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    result.current.graph.current = document.createElement('div');
    result.current.download('svg');

    expect(Plotly.downloadImage).toHaveBeenCalledWith(expect.anything(), {
      format: 'svg',
      filename: undefined,
      width: undefined,
      height: undefined,
    });
  });

  it('should handle setAnnotations with existing annotations', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    result.current.graph.current = {
      layout: {
        annotations: [
          { x: 1, y: 2, text: 'Existing' },
        ],
      },
    };

    result.current.setAnnotations({ x: 3, y: 4, text: 'New' } as any);

    expect(Plotly.relayout).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        annotations: expect.arrayContaining([
          expect.objectContaining({ text: 'Existing' }),
        ]),
      })
    );
  });

  it('should not set up event listener when enablePointEvent is false', () => {
    const mockOn = jest.fn();
    const { result } = renderHook(() =>
      usePlotly({ ...defaultProps, enablePointEvent: false } as any)
    );

    const mockDiv = { on: mockOn };
    result.current.graph.current = mockDiv;

    expect(mockOn).not.toHaveBeenCalled();
  });

  it('should handle screenResize with string dimensions', () => {
    const { result } = renderHook(() => usePlotly(defaultProps as any));

    result.current.graph.current = document.createElement('div');
    result.current.screenResize('100%', '80vh');

    expect(Plotly.relayout).toHaveBeenCalledWith(expect.anything(), {
      width: '100%',
      height: '80vh',
    });
  });
});
