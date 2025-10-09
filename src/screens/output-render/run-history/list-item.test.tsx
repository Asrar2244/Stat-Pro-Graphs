import { render, fireEvent } from '@utils/test-utils';
import { HistoryListRender } from './list-item';
import { useFormatter } from '@hooks';
import dayjs from 'dayjs';

jest.mock('@hooks', () => ({
  useFormatter: jest.fn(),
}));

jest.mock('@libs', () => ({
  CalenderTablet: ({ date }: { date: string }) => <div data-testid="calendar">{date}</div>,
}));

jest.mock('../styles-hook/use-run-history-style', () => ({
  useRunHistoryClasses: jest.fn(() => ({
    cardList: 'cardList',
    selectedItem: 'selectedItem',
    horizontalCardImage: 'horizontalCardImage',
    headerTitle: 'headerTitle',
    caption: 'caption',
  })),
}));

const mockDateTimeFormat = jest.fn((date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'));

describe('HistoryListRender Component', () => {
  const mockSelectedRun = jest.fn();
  const defaultProps = {
    id: 1,
    outputFor: 'Test Analysis',
    modifiedDateTime: '2024-01-15T10:30:00',
    selectedRun: mockSelectedRun,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFormatter as jest.Mock).mockReturnValue({
      dateTimeFormat: mockDateTimeFormat,
    });
  });

  it('renders list item with correct data', () => {
    const { getByText, getByTestId } = render(<HistoryListRender result={undefined} tabName={''} outputType={''} {...defaultProps} />);

    expect(getByText('Test Analysis')).toBeInTheDocument();
    expect(getByText('10:30:00')).toBeInTheDocument();
    expect(getByTestId('calendar')).toBeInTheDocument();
  });

  it('calls selectedRun with correct parameters on click', () => {
    const { container } = render(<HistoryListRender result={undefined} tabName={''} outputType={''} {...defaultProps} />);

    const listItem = container.querySelector('li');
    fireEvent.click(listItem!);

    expect(mockSelectedRun).toHaveBeenCalledWith(
      1,
      'Test Analysis',
      '2024-01-15 10:30:00'
    );
  });

  it('applies selected style when item is selected', () => {
    const { container } = render(
      <HistoryListRender result={undefined} tabName={''} outputType={''} {...defaultProps} selectedID={1} />
    );

    const listItem = container.querySelector('li');
    expect(listItem?.className).toContain('selectedItem');
  });

  it('does not apply selected style when item is not selected', () => {
    const { container } = render(
      <HistoryListRender result={undefined} tabName={''} outputType={''} {...defaultProps} selectedID={2} />
    );

    const listItem = container.querySelector('li');
    expect(listItem?.className).not.toContain('selectedItem');
  });

  it('formats time correctly', () => {
    const { getByText } = render(
      <HistoryListRender
        result={undefined} tabName={''} outputType={''} {...defaultProps}
        modifiedDateTime="2024-12-25T23:59:59" />
    );

    expect(getByText('23:59:59')).toBeInTheDocument();
  });

  it('displays calendar with correct date', () => {
    const { getByTestId } = render(<HistoryListRender result={undefined} tabName={''} outputType={''} {...defaultProps} />);

    const calendar = getByTestId('calendar');
    expect(calendar.textContent).toBe('2024-01-15T10:30:00');
  });

  it('renders with different output types', () => {
    const { getByText, rerender } = render(<HistoryListRender result={undefined} tabName={''} outputType={''} {...defaultProps} />);

    expect(getByText('Test Analysis')).toBeInTheDocument();

    rerender(
      <HistoryListRender
        result={undefined} tabName={''} outputType={''} {...defaultProps}
        outputFor="Regression Analysis" />
    );

    expect(getByText('Regression Analysis')).toBeInTheDocument();
  });
});
