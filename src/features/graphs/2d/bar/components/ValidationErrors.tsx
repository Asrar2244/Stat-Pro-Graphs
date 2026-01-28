import React from 'react';
import { Text, Button, tokens } from '@fluentui/react-components';
import { MdError, MdWarning, MdClose } from 'react-icons/md';
import { ValidationError } from '../utils/validationUtils';

interface ValidationErrorsProps {
    errors: ValidationError[];
    onDismiss?: () => void;
    showDismiss?: boolean;
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
    errors,
    onDismiss,
    showDismiss = true
}) => {
    if (errors.length === 0) {
        return null;
    }

    const errorErrors = errors.filter(e => e.severity === 'error');
    const warningErrors = errors.filter(e => e.severity === 'warning');

    return (
        <div style={{
            padding: '16px',
            margin: '16px 0',
            borderRadius: '8px',
            border: `1px solid ${tokens.colorPaletteRedBorder2}`,
            backgroundColor: tokens.colorPaletteRedBackground2
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdError size={20} color={tokens.colorPaletteRedForeground1} />
                    <Text weight="semibold" style={{ color: tokens.colorPaletteRedForeground1 }}>
                        {errorErrors.length > 0 ? 'Required Fields Missing' : 'Validation Warnings'}
                    </Text>
                </div>
                {showDismiss && onDismiss && (
                    <Button
                        appearance="transparent"
                        size="small"
                        icon={<MdClose />}
                        onClick={onDismiss}
                        style={{ minWidth: 'auto', padding: '4px' }}
                    />
                )}
            </div>

            {errorErrors.length > 0 && (
                <div style={{ marginBottom: warningErrors.length > 0 ? '12px' : '0' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                        {errorErrors.map((error, index) => (
                            <li key={index} style={{ marginBottom: '4px' }}>
                                <Text size={300} style={{ color: tokens.colorPaletteRedForeground1 }}>
                                    {error.message}
                                </Text>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {warningErrors.length > 0 && (
                <div style={{
                    padding: '12px',
                    borderRadius: '4px',
                    backgroundColor: tokens.colorPaletteYellowBackground2,
                    border: `1px solid ${tokens.colorPaletteYellowBorder2}`
                }}>
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                        {warningErrors.map((warning, index) => (
                            <li key={index} style={{ marginBottom: '4px' }}>
                                <Text size={300} style={{ color: tokens.colorPaletteYellowForeground1 }}>
                                    {warning.message}
                                </Text>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const FieldValidationIndicator: React.FC<{
    hasError: boolean;
    errorMessage?: string;
    children: React.ReactNode;
}> = ({ hasError, errorMessage, children }) => {
    return (
        <div style={{ position: 'relative' }}>
            {children}
            {hasError && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: tokens.colorPaletteRedBackground2,
                    border: `1px solid ${tokens.colorPaletteRedBorder2}`,
                    zIndex: 1000
                }}>
                    <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>
                        {errorMessage}
                    </Text>
                </div>
            )}
        </div>
    );
};
