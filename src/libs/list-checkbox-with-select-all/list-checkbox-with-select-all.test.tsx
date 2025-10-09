import { render } from '../../utils/test-utils';
import { ListCheckboxWithSelectAll } from './index';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
const mockOnSelectAllChanged = jest.fn();
const mockSetModelBulk = jest.fn();
const list = new Map([
    ['Item 1', false],
    ['Item 3', false],
    ['Item 2', true],
]);


const renderSetUp = () => render(<ListCheckboxWithSelectAll
    list={list}
    listSize={list.size}
    selectAllText="Select All"
    requiredSelectAll
    selectValue={false}
    onSelectAllChanged={mockOnSelectAllChanged}
    setModelBulk={mockSetModelBulk}
/>);
describe('ListCheckboxWithSelectAll Component', () => {

    it('renders checkboxes with correct labels', () => {
        const { getByText, getByRole } = renderSetUp();

        expect(getByText('Select All')).toBeInTheDocument();
        expect(getByRole('checkbox', { name: 'Item 1' })).toBeInTheDocument();
        expect(getByRole('checkbox', { name: 'Item 2' })).toBeInTheDocument();
    });

    it('checks individual checkboxes and updates state', () => {
        const { getByRole } = renderSetUp();
        const checkbox = getByRole('checkbox', { name: 'Item 1' });
        fireEvent.click(checkbox);
        expect(mockSetModelBulk).toHaveBeenCalled();
        expect(mockOnSelectAllChanged).toHaveBeenCalledWith('mixed');
    });

    it('checks "Select All" and updates all checkboxes', () => {
        const { getByRole } = renderSetUp();

        const selectAllCheckbox = getByRole('checkbox', { name: 'Select All' });
        fireEvent.click(selectAllCheckbox);
        expect(mockSetModelBulk).toHaveBeenCalled();
        expect(mockOnSelectAllChanged).toHaveBeenCalledWith(true);
    });
});
