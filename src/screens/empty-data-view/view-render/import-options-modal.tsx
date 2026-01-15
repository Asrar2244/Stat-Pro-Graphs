import { FC } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,
} from '@fluentui/react-components';
import { MdNoteAdd, MdOpenInNew } from 'react-icons/md';

interface ImportOptionsModalProps {
    open: boolean;
    onClose: () => void;
    onImportInSameView: () => void;
    onOpenNewView: () => void;
}

export const ImportOptionsModal: FC<ImportOptionsModalProps> = ({
    open,
    onClose,
    onImportInSameView,
    onOpenNewView,
}) => {
    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Import CSV Data</DialogTitle>
                    <DialogContent>
                        <p style={{ marginBottom: '16px' }}>
                            You are importing data into an existing project. How would you like to proceed?
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Button
                                appearance="primary"
                                icon={<MdNoteAdd />}
                                onClick={() => {
                                    onImportInSameView();
                                    onClose();
                                }}
                                style={{ justifyContent: 'flex-start' }}
                            >
                                Import in Same View
                            </Button>
                            <p style={{ fontSize: '12px', color: '#666', marginLeft: '32px', marginTop: '-8px' }}>
                                Append imported data as new columns to the right of existing data
                            </p>

                            <Button
                                appearance="secondary"
                                icon={<MdOpenInNew />}
                                onClick={() => {
                                    onOpenNewView();
                                    onClose();
                                }}
                                style={{ justifyContent: 'flex-start' }}
                            >
                                Open New Empty Data View
                            </Button>
                            <p style={{ fontSize: '12px', color: '#666', marginLeft: '32px', marginTop: '-8px' }}>
                                Open imported data in a new tab
                            </p>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
