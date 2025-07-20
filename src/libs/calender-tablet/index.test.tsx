import { render } from '../../utils/test-utils';
import { CalenderTablet, ICalenderTab } from './index';

import { useTranslation } from 'react-i18next';

jest.mock('dayjs', () => {
    const actualDayjs = jest.requireActual('dayjs');
    return {
        ...actualDayjs,
        format: jest.fn((fmt) => (fmt === 'MMM' ? 'Feb' : '2025')),
        date: jest.fn(() => 23),
        year: jest.fn(() => 2025),
    };
});

const renderSetUp = (x?: ICalenderTab) => render(<CalenderTablet date={x?.date} />);
afterAll(() => {
    jest.clearAllMocks();
})


jest.mock('dayjs', () => {
    const actualDayjs = jest.requireActual('dayjs');
    const mockDayjs = jest.fn((date) => actualDayjs(date));
    return Object.assign(mockDayjs, actualDayjs);
});

jest.mock('react-i18next', () => ({
    ...jest.requireActual('react-i18next'),
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('CalenderTablet Component', () => {
    it('should render correctly with a given date', () => {
        const { getByText } = renderSetUp({ date: "2025-02-23" });

        expect(getByText('Feb')).toBeInTheDocument();
        expect(getByText('23')).toBeInTheDocument();
        expect(getByText('2025')).toBeInTheDocument();
    });

    it('should not render anything if date is not provided', () => {
        const { queryByText } = renderSetUp();

        expect(queryByText('Feb')).not.toBeInTheDocument();
        expect(queryByText('23')).not.toBeInTheDocument();
        expect(queryByText('2025')).not.toBeInTheDocument();
    });

    it('should render translated text correctly', () => {
        const { getByText } = renderSetUp({ date: "2025-02-23" });
        const { t } = useTranslation();

        expect(getByText(t('Feb'))).toBeInTheDocument();
        expect(getByText(t('23'))).toBeInTheDocument();
        expect(getByText(t('2025'))).toBeInTheDocument();
    });
});
