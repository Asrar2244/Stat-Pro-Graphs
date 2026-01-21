import React from 'react';
import { Text, Button, tokens } from '@fluentui/react-components';
import { MdError, MdWarning, MdClose } from 'react-icons/md';
import type { ValidationError } from '../types';

interface ValidationErrorsProps {
    errors: ValidationError[];
    onDismiss?: () => void;
    showDismiss?: boolean;
}

/**
 * Component to display validation errors in a user-friendly way
 */
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
            {/* Header */}
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

            {/* Error Messages */}
            {errorErrors.length > 0 && (
                <div style={{ marginBottom: warningErrors.length > 0 ? '12px' : '0' }}>
                    <Text size={300} weight="semibold" style={{
                        color: tokens.colorPaletteRedForeground1,
                        marginBottom: '8px',
                        display: 'block'
                    }}>
                        Please fix the following issues:
                    </Text>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        listStyleType: 'disc'
                    }}>
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

            {/* Warning Messages */}
            {warningErrors.length > 0 && (
                <div style={{
                    padding: '12px',
                    borderRadius: '4px',
                    backgroundColor: tokens.colorPaletteYellowBackground2,
                    border: `1px solid ${tokens.colorPaletteYellowBorder2}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <MdWarning size={16} color={tokens.colorPaletteYellowForeground1} />
                        <Text size={300} weight="semibold" style={{
                            color: tokens.colorPaletteYellowForeground1
                        }}>
                            Warnings:
                        </Text>
                    </div>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        listStyleType: 'disc'
                    }}>
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
