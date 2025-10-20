import { render } from '@utils/test-utils';
import { GraphsRender } from './index';

jest.mock('./top-stripe', () => ({
  TopStripe: () => <div data-testid="top-stripe">TopStripe</div>,
}));

jest.mock('./graph-body-render', () => ({
  GraphBodyRender: () => <div data-testid="graph-body-render">GraphBodyRender</div>,
}));

jest.mock('./styles-hook/use-graph-view', () => ({
  useGraphViewLayout: jest.fn(() => ({
    toolStrip: 'mock-tool-strip-class',
  })),
}));

describe('GraphsRender Component', () => {
  it('renders TopStripe component', () => {
    const { getByTestId } = render(<GraphsRender />);

    expect(getByTestId('top-stripe')).toBeInTheDocument();
  });

  it('renders GraphBodyRender component', () => {
    const { getByTestId } = render(<GraphsRender />);

    expect(getByTestId('graph-body-render')).toBeInTheDocument();
  });

  it('applies correct class from useGraphViewLayout hook', () => {
    const { container } = render(<GraphsRender />);

    const wrapper = container.querySelector('.mock-tool-strip-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders both child components together', () => {
    const { getByTestId } = render(<GraphsRender />);

    expect(getByTestId('top-stripe')).toBeInTheDocument();
    expect(getByTestId('graph-body-render')).toBeInTheDocument();
  });

  it('has correct component structure', () => {
    const { getByTestId } = render(<GraphsRender />);

    const topStripe = getByTestId('top-stripe');
    const graphBody = getByTestId('graph-body-render');

    expect(topStripe).toBeInTheDocument();
    expect(graphBody).toBeInTheDocument();
  });
});
