import React, { useState } from 'react';
import { Dialog, DialogSurface, DialogTitle, DialogBody, DialogContent, DialogActions, Button, Text, tokens, Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';
import { MdError, MdWarning, MdClose, MdRefresh, MdInfo, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { ValidationError } from '../utils/validationUtils';

interface AdvancedValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationError[];
  onRetry?: () => void;
  title?: string;
  showDetailedHelp?: boolean;
}

/**
 * Advanced validation error modal with detailed help and better UX
 */
export const AdvancedValidationModal: React.FC<AdvancedValidationModalProps> = ({
  isOpen,
  onClose,
  errors,
  onRetry,
  title = "Cannot Create Line-Scatter Plot",
  showDetailedHelp = true
}) => {
  const [showHelp, setShowHelp] = useState(false);

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

  const getHelpContent = () => {
    const errorFields = [...new Set(errorErrors.map(e => e.field))];
    const helpItems = [];

    if (errorFields.includes('xVariables') || errorFields.includes('yVariables')) {
      helpItems.push({
        title: "X and Y Variables Required",
        content: "Every line-scatter plot needs at least one X-axis variable and one Y-axis variable. Select variables from your project data to plot on each axis."
      });
    }

    if (errorFields.includes('categoryVariables')) {
      helpItems.push({
        title: "Category Variables for Grouped Plots",
        content: "Grouped line-scatter plots require category variables to separate data points into different groups. This creates multiple series in your graph."
      });
    }

    if (errorFields.includes('errorBarVariables')) {
      helpItems.push({
        title: "Error Bar Variables",
        content: "Error bar plots need additional variables to show uncertainty or standard deviation. Select variables that contain error values for your data points."
      });
    }

    if (errorFields.includes('subType') || errorFields.includes('dataFormat')) {
      helpItems.push({
        title: "Graph Type and Data Format",
        content: "Choose the appropriate line-scatter plot type and data format that matches your data structure. Different types have different variable requirements."
      });
    }

    return helpItems;
  };

  const helpContent = getHelpContent();

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => {
      if (!data.open) {
        onClose();
      }
    }}>
      <DialogSurface style={{
        maxWidth: '700px',
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
            <br />
            <Text size={200} style={{ 
              color: tokens.colorNeutralForeground2,
              marginTop: '4px'
            }}>
              {errorErrors.length} error{errorErrors.length !== 1 ? 's' : ''} and {warningErrors.length} warning{warningErrors.length !== 1 ? 's' : ''} found
            </Text>
          </div>
          <Button
            appearance="transparent"
            size="small"
            icon={<MdClose />}
            onClick={onClose}
            style={{ minWidth: 'auto' }}
          />
        </DialogTitle>

        <DialogBody style={{ padding: '0', overflow: 'auto', maxHeight: 'calc(80vh - 140px)' }}>
          <DialogContent style={{ padding: '24px' }}>
            {/* Main Error Messages */}
            {errorErrors.length > 0 && (
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: tokens.colorPaletteRedBackground2,
                border: `2px solid ${tokens.colorPaletteRedBorder2}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <MdError size={24} color={tokens.colorPaletteRedForeground1} />
                  <Text size={400} weight="semibold" style={{ 
                    color: tokens.colorPaletteRedForeground1
                  }}>
                    Required Fields Missing
                  </Text>
                </div>
                
                <ul style={{
                  margin: 0,
                  paddingLeft: '24px',
                  listStyleType: 'disc'
                }}>
                  {errorErrors.map((error, index) => (
                    <li key={index} style={{ 
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
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
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: tokens.colorPaletteYellowBackground2,
                border: `2px solid ${tokens.colorPaletteYellowBorder2}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <MdWarning size={24} color={tokens.colorPaletteYellowForeground1} />
                  <Text size={400} weight="semibold" style={{ 
                    color: tokens.colorPaletteYellowForeground1 
                  }}>
                    Warnings
                  </Text>
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '24px',
                  listStyleType: 'disc'
                }}>
                  {warningErrors.map((warning, index) => (
                    <li key={index} style={{ 
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      <Text size={300} style={{ color: tokens.colorPaletteYellowForeground1 }}>
                        {warning.message}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Help Section */}
            {showDetailedHelp && helpContent.length > 0 && (
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: tokens.colorNeutralBackground2,
                border: `1px solid ${tokens.colorNeutralStroke2}`
              }}>
                <Button
                  appearance="transparent"
                  onClick={() => setShowHelp(!showHelp)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 0',
                    marginBottom: showHelp ? '16px' : '0'
                  }}
                >
                  <MdInfo size={20} color={tokens.colorNeutralForeground1} />
                  <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>
                    Need Help?
                  </Text>
                  {showHelp ? <MdExpandLess /> : <MdExpandMore />}
                </Button>

                {showHelp && (
                  <Accordion>
                    {helpContent.map((item, index) => (
                      <AccordionItem key={index} value={index}>
                        <AccordionHeader style={{ 
                          padding: '12px 0',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {item.title}
                        </AccordionHeader>
                        <AccordionPanel style={{ 
                          padding: '0 0 12px 0',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          color: tokens.colorNeutralForeground2
                        }}>
                          {item.content}
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            )}
          </DialogContent>
        </DialogBody>

        <DialogActions style={{ 
          padding: '20px 24px',
          borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
          backgroundColor: tokens.colorNeutralBackground1
        }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
            <Button
              appearance="secondary"
              onClick={onClose}
              size="medium"
            >
              Close
            </Button>
            {onRetry && (
              <Button
                appearance="primary"
                icon={<MdRefresh />}
                onClick={handleRetry}
                size="medium"
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