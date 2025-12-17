import React from 'react';
import { Dialog, DialogSurface, DialogTitle, DialogBody, DialogContent, DialogActions, Button, Text, tokens } from '@fluentui/react-components';
import { MdError, MdWarning, MdInfo, MdClose, MdRefresh } from 'react-icons/md';
import { ValidationError } from '../types/validation';

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationError[];
  onRetry?: () => void;
  title?: string;
  graphType?: string;
}

/**
 * Generic modal component to display validation errors in a user-friendly way
 * Works for all graph types (Line, Scatter, 3D Mesh, etc.)
 * 
 * @example
 * ```tsx
 * <ValidationErrorModal
 *   isOpen={showErrors}
 *   onClose={() => setShowErrors(false)}
 *   errors={validationErrors}
 *   graphType="Line Plot"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isOpen,
  onClose,
  errors,
  onRetry,
  title,
  graphType = "Graph"
}) => {
  if (!isOpen || errors.length === 0) {
    return null;
  }

  const defaultTitle = title || `Cannot Create ${graphType}`;
  const errorErrors = errors.filter(e => e.severity === 'error');
  const warningErrors = errors.filter(e => e.severity === 'warning');
  const infoErrors = errors.filter(e => e.severity === 'info');

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
        width: '90vw'
      }}>
        <DialogTitle style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px 24px 16px 24px'
        }}>
          <MdError size={24} color={tokens.colorPaletteRedForeground1} />
          <Text size={500} weight="semibold" style={{ 
            color: tokens.colorPaletteRedForeground1,
            flex: 1
          }}>
            {defaultTitle}
          </Text>
          <Button
            appearance="transparent"
            size="small"
            icon={<MdClose />}
            onClick={onClose}
            style={{ minWidth: 'auto' }}
          />
        </DialogTitle>

        <DialogBody style={{ padding: '0 24px' }}>
          <DialogContent style={{ padding: '16px 0' }}>
            {/* Error Messages */}
            {errorErrors.length > 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: tokens.colorPaletteRedBackground2,
                border: `1px solid ${tokens.colorPaletteRedBorder2}`
              }}>
                <Text size={400} weight="semibold" style={{ 
                  color: tokens.colorPaletteRedForeground1,
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Please fix the following issues before creating the {graphType.toLowerCase()}:
                </Text>
                
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  listStyleType: 'disc'
                }}>
                  {errorErrors.map((error, index) => (
                    <li key={index} style={{ marginBottom: '6px' }}>
                      <Text size={300} style={{ color: tokens.colorPaletteRedForeground1 }}>
                        {error.field && <strong>{error.field}: </strong>}
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
                marginBottom: '16px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: tokens.colorPaletteYellowBackground2,
                border: `1px solid ${tokens.colorPaletteYellowBorder2}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MdWarning size={20} color={tokens.colorPaletteYellowForeground1} />
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
                        {warning.field && <strong>{warning.field}: </strong>}
                        {warning.message}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Info Messages */}
            {infoErrors.length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: tokens.colorPaletteBlueBackground2,
                border: `1px solid ${tokens.colorPaletteBlueBorder2}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MdInfo size={20} color={tokens.colorPaletteBlueForeground1} />
                  <Text size={300} weight="semibold" style={{ 
                    color: tokens.colorPaletteBlueForeground1 
                  }}>
                    Information:
                  </Text>
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  listStyleType: 'disc'
                }}>
                  {infoErrors.map((info, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>
                      <Text size={300} style={{ color: tokens.colorPaletteBlueForeground1 }}>
                        {info.field && <strong>{info.field}: </strong>}
                        {info.message}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Help Text */}
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: tokens.colorNeutralBackground2,
              border: `1px solid ${tokens.colorNeutralStroke2}`
            }}>
              <Text size={300} style={{ 
                color: tokens.colorNeutralForeground2,
                lineHeight: '1.4'
              }}>
                💡 <strong>Tip:</strong> Make sure to select the required variables for your chosen {graphType.toLowerCase()} type. 
                Different graph types require different variable combinations (X, Y, Z, Category, Error Bar).
              </Text>
            </div>
          </DialogContent>
        </DialogBody>

        <DialogActions style={{ padding: '16px 24px 24px 24px' }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
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
                style={{
                  backgroundColor: tokens.colorPaletteRedBackground1,
                  color: tokens.colorPaletteRedForeground1
                }}
              >
                Fix Issues & Retry
              </Button>
            )}
          </div>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};




















