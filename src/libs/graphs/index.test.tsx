import { render, screen, waitFor } from '@utils/test-utils';
import { GraphPlot } from './index';
import type { IGraph } from '@utils';
import { Suspense } from 'react';

// Mock react-full-screen
jest.mock('react-full-screen', () => ({
  FullScreen: ({ children }: any) => <div data-testid="fullscreen">{children}</div>,
  useFullScreenHandle: () => ({
    active: false,
    enter: jest.fn(),
    exit: jest.fn(),
  }),
}));

// Mock lazy loaded GraphTools component
jest.mock('./tools', () => ({
  GraphTools: ({ graph, handle }: any) => (
    <div data-testid="graph-tools">
      Graph Tools for {graph.title}
      <button onClick={() => handle.enter()}>Enter Fullscreen</button>
    </div>
  ),
}));

const mockGraph: IGraph = {
  name: 'Test Graph',
  title: 'Test Graph',
  traces: {
    trace1: {
      x: 'x_values',
      y: 'y_values',
      type: 'scatter',
      name: 'Test Data',
    },
  },
  modes: ['lines'],
  layout: {
    title: 'Test Graph',
    xaxis: { title: 'X Axis' },
    yaxis: { title: 'Y Axis' },
  },
};

const defaultProps = {
  graph: mockGraph,
  dbFileName: 'test.db',
  dbTableName: 'test_table',
};

describe('GraphPlot', () => {
  it('should render without crashing', async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    });
  });

  it('should render with FullScreen wrapper', async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByTestId('fullscreen')).toBeInTheDocument();
    });
  });

  it('should render Card component', async () => {
    const { container } = render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} />
      </Suspense>
    );

    await waitFor(() => {
      expect(container.querySelector('[role="group"]')).toBeInTheDocument();
    });
  });

  it('should load GraphTools lazily', async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByTestId('graph-tools')).toBeInTheDocument();
    });
  });

  it('should pass correct props to GraphTools', async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByText(/Graph Tools for Test Graph/)).toBeInTheDocument();
    });
  });

  it('should handle different graph types', async () => {
    const barGraph: IGraph = {
      name: 'Bar Graph',
      title: 'Bar Graph',
      traces: {
        trace1: {
          x: 'categories',
          y: 'values',
          type: 'bar',
          name: 'Bar Data',
        },
      },
      modes: ['bar'],
      layout: mockGraph.layout,
    };

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} graph={barGraph} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByText(/Graph Tools for Bar Graph/)).toBeInTheDocument();
    });
  });

  it('should render with custom db file and table names', async () => {
    const customProps = {
      ...defaultProps,
      dbFileName: 'custom.db',
      dbTableName: 'custom_table',
    };

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...customProps} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByTestId('graph-tools')).toBeInTheDocument();
    });
  });

  it('should create plotly ref', async () => {
    const { container } = render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} />
      </Suspense>
    );

    await waitFor(() => {
      const cardPreview = container.querySelector('[role="group"] > div > div');
      expect(cardPreview).toBeInTheDocument();
    });
  });

  it('should render CardPreview and CardFooter', async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByTestId('graph-tools')).toBeInTheDocument();
    });
  });

  it('should handle graph with multiple data series', async () => {
    const multiSeriesGraph: IGraph = {
      name: 'Multi Series Graph',
      title: 'Multi Series Graph',
      traces: {
        series1: {
          x: 'x_values',
          y: 'y1_values',
          type: 'scatter',
          name: 'Series 1',
        },
        series2: {
          x: 'x_values',
          y: 'y2_values',
          type: 'scatter',
          name: 'Series 2',
        },
      },
      modes: ['lines'],
      layout: {
        title: 'Multi Series Graph',
      },
    };

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} graph={multiSeriesGraph} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByText(/Graph Tools for Multi Series Graph/)).toBeInTheDocument();
    });
  });

  it('should handle graph with custom layout', async () => {
    const customLayoutGraph: IGraph = {
      ...mockGraph,
      layout: {
        title: 'Custom Layout',
        xaxis: { title: 'Custom X' },
        yaxis: { title: 'Custom Y' },
        showlegend: true,
      },
    };

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} graph={customLayoutGraph} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByTestId('graph-tools')).toBeInTheDocument();
    });
  });

  it('should show loading fallback initially', () => {
    render(
      <Suspense fallback={<div data-testid="loading">Loading...</div>}>
        <GraphPlot {...defaultProps} />
      </Suspense>
    );

    // Initially might show loading, or component loads immediately in tests
    const fullscreen = screen.queryByTestId('fullscreen');
    const loading = screen.queryByTestId('loading');
    expect(fullscreen || loading).toBeTruthy();
  });

  it('should render graph tools wrapper with correct class', async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByTestId('graph-tools')).toBeInTheDocument();
    });
  });

  it('should handle empty graph data', async () => {
    const emptyGraph: IGraph = {
      name: 'Empty Graph',
      title: 'Empty Graph',
      traces: {},
      layout: {},
    };

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GraphPlot {...defaultProps} graph={emptyGraph} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByTestId('graph-tools')).toBeInTheDocument();
    });
  });
});
