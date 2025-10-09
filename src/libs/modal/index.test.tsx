
import { render } from '../../utils/test-utils';
import { Modal, IDialogProps } from './index';
import { fireEvent } from '@testing-library/react';

const renderSetUp = (props?: Partial<IDialogProps>) => {
    const defaultProps: IDialogProps = {
        open: true,
        title: 'Test Modal',
        okLabel: 'OK',
        cancelLabel: 'Cancel',
        showCancel: true,
        closeModal: jest.fn(),
        toggleModal: jest.fn(),
        openModal: jest.fn(),
    };

    return render(<Modal {...defaultProps} {...props}><p>Content</p></Modal>);
};

describe('Modal Component', () => {
    it('renders the modal with title and buttons', () => {
        const { getByText } = renderSetUp();
        expect(getByText('Test Modal')).toBeInTheDocument();
        expect(getByText('OK')).toBeInTheDocument();
        expect(getByText('Cancel')).toBeInTheDocument();
    });

    it('calls closeModal when close button is clicked', () => {
        const closeModal = jest.fn();
        const { getByRole } = renderSetUp({ closeModal });

        fireEvent.click(getByRole('button', { name: /cancel/i }));
        expect(closeModal).toHaveBeenCalled();
    });

    it('calls ok function when OK button is clicked', () => {
        const onOk = jest.fn();
        const { getByText } = renderSetUp({ ok: { onClick: onOk } });

        fireEvent.click(getByText('OK'));
        expect(onOk).toHaveBeenCalled();
    });

    it('calls cancel function when Cancel button is clicked', () => {
        const onCancel = jest.fn();
        const { getByText } = renderSetUp({ cancel: { onClick: onCancel } });

        fireEvent.click(getByText('Cancel'));
        expect(onCancel).toHaveBeenCalled();
    });

    it('renders translated text', () => {
        const { getByText } = renderSetUp({ title: 'modal.title' });

        expect(getByText('modal.title')).toBeInTheDocument();
    });
});
