import { FC, useState, useEffect } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,
    Dropdown,
    Option,
    Label,
} from '@fluentui/react-components';

interface SheetSelectionModalProps {
    open: boolean;
    sheetNames: string[];
    onClose: () => void;
    onConfirm: (sheetName: string) => void;
}

export const SheetSelectionModal: FC<SheetSelectionModalProps> = ({
    open,
    sheetNames,
    onClose,
    onConfirm,
}) => {
    const [selectedSheet, setSelectedSheet] = useState<string>(sheetNames[0] || '');

    // Reset selection when modal opens or sheets change
    useEffect(() => {
        if (open && sheetNames.length > 0) {
            setSelectedSheet(sheetNames[0]);
        }
    }, [open, sheetNames]);

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Select Worksheet</DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
                            <Label>Select the worksheet to import:</Label>
                            <Dropdown
                                value={selectedSheet}
                                selectedOptions={[selectedSheet]}
                                onOptionSelect={(_, data) => setSelectedSheet(data.optionValue || '')}
                                placeholder="Select a sheet"
                            >
                                {sheetNames.map((sheet) => (
                                    <Option key={sheet} value={sheet}>
                                        {sheet}
                                    </Option>
                                ))}
                            </Dropdown>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={() => onConfirm(selectedSheet)}
                            disabled={!selectedSheet}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
