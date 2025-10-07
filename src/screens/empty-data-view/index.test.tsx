import { render } from '@utils/test-utils';
import { EmptyDataView } from './index';
import { useContext } from 'react';
import { EmptyDataContext } from './context';

let contextValue: any;

const MockToolStrip = () => {
  contextValue = useContext(EmptyDataContext);
  return <div data-testid="tool-strip">ToolStrip</div>;
};

const MockViewRender = () => {
  return <div data-testid="view-render">ViewRender</div>;
};

jest.mock('./tool-strip', () => ({
  ToolStrip: () => MockToolStrip(),
}));

jest.mock('./view-render', () => ({
  ViewRender: () => MockViewRender(),
}));

describe('EmptyDataView Component', () => {
  beforeEach(() => {
    contextValue = undefined;
  });

  it('renders ToolStrip and ViewRender components', () => {
    const { getByTestId } = render(<EmptyDataView />);

    expect(getByTestId('tool-strip')).toBeInTheDocument();
    expect(getByTestId('view-render')).toBeInTheDocument();
  });

  it('provides context with initial values', () => {
    render(<EmptyDataView />);

    expect(contextValue).toBeDefined();
  });

  it('initializes with empty data array', () => {
    render(<EmptyDataView />);

    expect(contextValue?.data).toEqual([]);
  });

  it('initializes with undefined dataState', () => {
    render(<EmptyDataView />);

    expect(contextValue?.dataState).toBeUndefined();
  });

  it('initializes with empty columns object', () => {
    render(<EmptyDataView />);

    expect(contextValue?.columns).toEqual({});
  });

  it('provides setData function in context', () => {
    render(<EmptyDataView />);

    expect(typeof contextValue?.setData).toBe('function');
  });

  it('provides setColumns function in context', () => {
    render(<EmptyDataView />);

    expect(typeof contextValue?.setColumns).toBe('function');
  });
});
