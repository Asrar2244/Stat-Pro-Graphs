import React, { useState } from 'react';
import { Dialog, DialogSurface, DialogTitle, DialogBody, DialogContent, DialogActions, Button, Text, tokens } from '@fluentui/react-components';
import { MdError, MdWarning, MdClose, MdRefresh } from 'react-icons/md';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface AdvancedValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationError[];
  onRetry?: () => void;
  title?: string;
  showDetailedHelp?: boolean;
  dataFormat?: string;
}

/**
 * Advanced validation error modal with detailed help and better UX
 */
export const AdvancedValidationModal: React.FC<AdvancedValidationModalProps> = ({
  isOpen,
  onClose,
  errors,
  onRetry,
  title = "Cannot Create 3D Mesh Plot",
  showDetailedHelp = true,
  dataFormat
}) => {
  if (!isOpen || errors.length === 0) {
    return null;
  }

  const errorErrors = errors.filter(e => e.severity === 'error');
  const warningErrors = errors.filter(e => e.severity === 'warning');

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => {
      if (!data.open) {
        onClose();
      }
    }}>
      <DialogSurface style={{
        maxWidth: '600px',
        width: '90vw',
        maxHeight: '80vh'
      }}>
        <DialogTitle style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px 24px 16px 24px',
          borderBottom: `1px solid ${tokens.colorNeutralStroke2}`
        }}>
          <MdError size={28} color={tokens.colorPaletteRedForeground1} />
          <div style={{ flex: 1 }}>
            <Text size={500} weight="semibold" style={{ 
              color: tokens.colorPaletteRedForeground1
            }}>
              {title}
            </Text>
            <Text size={200} style={{ 
              color: tokens.colorNeutralForeground2,
              marginTop: '4px'
            }}>
              Please fix the following issues before creating your graph
            </Text>
          </div>
          <Button
            appearance="transparent"
            icon={<MdClose />}
            onClick={onClose}
            size="small"
          />
        </DialogTitle>

        <DialogBody style={{ padding: '0' }}>
          <DialogContent style={{ padding: '24px' }}>
            {/* Error Messages */}
            {errorErrors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <Text size={400} weight="semibold" style={{ 
                  color: tokens.colorPaletteRedForeground1,
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <MdError size={20} />
                  Errors ({errorErrors.length})
                </Text>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {errorErrors.map((error, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      backgroundColor: tokens.colorPaletteRedBackground2,
                      border: `1px solid ${tokens.colorPaletteRedBorder1}`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <MdError size={16} color={tokens.colorPaletteRedForeground1} style={{ marginTop: '2px' }} />
                      <Text size={300} style={{ color: tokens.colorPaletteRedForeground1 }}>
                        {error.message}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Messages */}
            {warningErrors.length > 0 && (
              <div>
                <Text size={400} weight="semibold" style={{ 
                  color: tokens.colorPaletteDarkOrangeForeground1,
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <MdWarning size={20} />
                  Warnings ({warningErrors.length})
                </Text>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {warningErrors.map((error, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      backgroundColor: tokens.colorPaletteDarkOrangeBackground2,
                      border: `1px solid ${tokens.colorPaletteDarkOrangeBorder1}`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <MdWarning size={16} color={tokens.colorPaletteDarkOrangeForeground1} style={{ marginTop: '2px' }} />
                      <Text size={300} style={{ color: tokens.colorPaletteDarkOrangeForeground1 }}>
                        {error.message}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Text */}
            {showDetailedHelp && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: tokens.colorNeutralBackground2,
                borderRadius: '6px',
                border: `1px solid ${tokens.colorNeutralStroke2}`
              }}>
                <Text size={300} weight="semibold" style={{ 
                  color: tokens.colorNeutralForeground1,
                  marginBottom: '8px'
                }}>
                  💡 Quick Help
                </Text>
                <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                  {(() => {
                    switch (dataFormat) {
                      case 'XYZ Triplets':
                        return '• XYZ Triplets: Requires 1 X, 1 Y, and 1 Z variable<br/>• Make sure you have selected a project with data';
                      case 'Many Z':
                        return '• Many Z: Requires exactly 2 Z variables (first and last)<br/>• X/Y scales are automatically generated<br/>• Make sure you have selected a project with data';
                      case 'XY Many Z':
                        return '• XY Many Z: Requires 1 X, 1 Y, and exactly 2 Z variables (first and last)<br/>• Make sure you have selected a project with data';
                      default:
                        return '• XYZ Triplets: Requires 1 X, 1 Y, and 1 Z variable<br/>• Many Z: Requires exactly 2 Z variables (first and last)<br/>• XY Many Z: Requires 1 X, 1 Y, and exactly 2 Z variables (first and last)<br/>• Make sure you have selected a project with data';
                    }
                  })()}
                </Text>
              </div>
            )}
          </DialogContent>
        </DialogBody>

        <DialogActions style={{
          padding: '16px 24px',
          borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <Button
            appearance="secondary"
            onClick={onClose}
          >
            Close
          </Button>
          {onRetry && (
            <Button
              appearance="primary"
              icon={<MdRefresh />}
              onClick={handleRetry}
            >
              Try Again
            </Button>
          )}
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};
