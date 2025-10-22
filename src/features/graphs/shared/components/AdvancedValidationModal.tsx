import React, { useState } from 'react';
import { Dialog, DialogSurface, DialogTitle, DialogBody, DialogContent, DialogActions, Button, Text, tokens, Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';
import { MdError, MdWarning, MdClose, MdRefresh, MdInfo, MdExpandMore, MdExpandLess, MdCheckCircle } from 'react-icons/md';
import { ValidationError } from '../types/validation';

interface AdvancedValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationError[];
  onRetry?: () => void;
  title?: string;
  showDetailedHelp?: boolean;
  graphType?: string;
  dataFormat?: string; // Added for context-aware help
  selectedVariables?: {
    x?: string[];
    y?: string[];
    z?: string[];
    category?: string[];
    errorBar?: string[];
  };
}

/**
 * Advanced validation error modal with intelligent, context-aware help
 * Provides specific guidance based on data format and selected variables
 * 
 * @example
 * ```tsx
 * <AdvancedValidationModal
 *   isOpen={showErrors}
 *   onClose={() => setShowErrors(false)}
 *   errors={validationErrors}
 *   graphType="Line Plot"
 *   dataFormat="XY Pair"
 *   selectedVariables={{ x: ['var1'], y: [] }}
 *   showDetailedHelp={true}
 * />
 * ```
 */
export const AdvancedValidationModal: React.FC<AdvancedValidationModalProps> = ({
  isOpen,
  onClose,
  errors,
  onRetry,
  title,
  showDetailedHelp = true,
  graphType = "Graph",
  dataFormat,
  selectedVariables
}) => {
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen || errors.length === 0) {
    return null;
  }

  const defaultTitle = title || `Cannot Create ${graphType}`;
  const errorErrors = errors.filter(e => e.severity === 'error');
  const warningErrors = errors.filter(e => e.severity === 'warning');

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    onClose();
  };

  /**
   * Get current selection status for smart help
   */
  const getSelectionStatus = () => {
    if (!selectedVariables) return null;

    const hasX = selectedVariables.x && selectedVariables.x.length > 0;
    const hasY = selectedVariables.y && selectedVariables.y.length > 0;
    const hasZ = selectedVariables.z && selectedVariables.z.length > 0;
    const hasCategory = selectedVariables.category && selectedVariables.category.length > 0;
    const hasErrorBar = selectedVariables.errorBar && selectedVariables.errorBar.length > 0;

    const xCount = selectedVariables.x?.length || 0;
    const yCount = selectedVariables.y?.length || 0;
    const zCount = selectedVariables.z?.length || 0;

    return { hasX, hasY, hasZ, hasCategory, hasErrorBar, xCount, yCount, zCount };
  };

  /**
   * Generate intelligent, context-aware help content
   */
  const getHelpContent = () => {
    const errorFields = [...new Set(errorErrors.map(e => e.field))];
    const helpItems = [];
    const status = getSelectionStatus();

    // Data Format Specific Help
    if (dataFormat) {
      const formatHelp = getDataFormatHelp(dataFormat, status);
      if (formatHelp) {
        helpItems.push(formatHelp);
      }
    }

    // Variable-specific help based on what's missing/wrong
    if (errorFields.includes('xVariables') || errorFields.includes('yVariables')) {
      if (status) {
        if (!status.hasX && !status.hasY) {
          helpItems.push({
            title: "❌ No Variables Selected",
            content: `You haven't selected any X or Y variables yet. ${graphType}s require data for both axes to visualize your data points.`,
            icon: "error"
          });
        } else if (status.hasX && !status.hasY) {
          helpItems.push({
            title: "⚠️ Missing Y Variable",
            content: `You've selected ${status.xCount} X variable(s), but no Y variables. For ${dataFormat || 'this format'}, you need both X and Y variables to create the plot.`,
            icon: "warning"
          });
        } else if (!status.hasX && status.hasY) {
          helpItems.push({
            title: "⚠️ Missing X Variable",
            content: `You've selected ${status.yCount} Y variable(s), but no X variables. For ${dataFormat || 'this format'}, you need both X and Y variables to create the plot.`,
            icon: "warning"
          });
        }
      } else {
        helpItems.push({
          title: "X and Y Variables Required",
          content: `Every ${graphType.toLowerCase()} needs at least one X-axis variable and one Y-axis variable. Select variables from your project data to plot on each axis.`,
          icon: "info"
        });
      }
    }

    // Z Variables for 3D
    if (errorFields.includes('zVariables')) {
      if (status && status.hasX && status.hasY && !status.hasZ) {
        helpItems.push({
          title: "⚠️ Missing Z Variable for 3D Plot",
          content: `You've selected X (${status.xCount}) and Y (${status.yCount}) variables, but 3D plots require a Z variable as well. Select at least one Z variable to create the depth dimension.`,
          icon: "warning"
        });
      } else {
        helpItems.push({
          title: "Z Variables for 3D Plots",
          content: "3D plots require a Z-axis variable in addition to X and Y. This creates a three-dimensional visualization of your data.",
          icon: "info"
        });
      }
    }

    // Category Variables
    if (errorFields.includes('categoryVariables')) {
      helpItems.push({
        title: "Category Variables for Grouped Plots",
        content: `Grouped ${graphType.toLowerCase()}s require category variables to separate data points into different groups. This creates multiple series in your graph with different colors or markers.`,
        icon: "info"
      });
    }

    // Error Bar Variables
    if (errorFields.includes('errorBarVariables')) {
      const errorBarTypes = getErrorBarTypeFromErrors(errorErrors);
      helpItems.push({
        title: "Error Bar Variables Required",
        content: `${errorBarTypes} error bar plots need additional variables to show uncertainty or standard deviation. Select variables that contain error values for your data points.`,
        icon: "info"
      });
    }

    // Project Selection
    if (errorFields.includes('project')) {
      helpItems.push({
        title: "Project Selection Required",
        content: "Select a project that contains the data you want to visualize. Each project has its own datasets and variables.",
        icon: "error"
      });
    }

    // Data Format
    if (errorFields.includes('subType') || errorFields.includes('dataFormat')) {
      helpItems.push({
        title: "Graph Type and Data Format",
        content: "Choose the appropriate graph type and data format that matches your data structure. Different types have different variable requirements.",
        icon: "info"
      });
    }

    return helpItems;
  };

  /**
   * Get data format-specific help
   */
  const getDataFormatHelp = (format: string, status: any) => {
    const formatLower = format.toLowerCase();

    if (formatLower.includes('single x')) {
      return {
        title: `📊 Single X Format Requirements`,
        content: status?.hasX 
          ? `✅ Good! You have ${status.xCount} X variable(s) selected. Single X format plots multiple Y series against one common X variable.`
          : `Single X format requires one X variable and one or more Y variables. The X variable is shared across all Y series.`,
        icon: status?.hasX ? "success" : "info"
      };
    }

    if (formatLower.includes('single y')) {
      return {
        title: `📊 Single Y Format Requirements`,
        content: status?.hasY
          ? `✅ Good! You have ${status.yCount} Y variable(s) selected. Single Y format plots multiple X series against one common Y variable.`
          : `Single Y format requires one Y variable and one or more X variables. The Y variable is shared across all X series.`,
        icon: status?.hasY ? "success" : "info"
      };
    }

    if (formatLower.includes('xy pair') || formatLower.includes('x y pair')) {
      if (status && status.xCount > 1 && status.yCount > 1 && status.xCount !== status.yCount) {
        return {
          title: `⚠️ XY Pair Format: Mismatched Counts`,
          content: `You have ${status.xCount} X variables and ${status.yCount} Y variables. XY Pair format requires equal numbers of X and Y variables (they are paired 1:1).`,
          icon: "warning"
        };
      }
      return {
        title: `📊 XY Pair Format Requirements`,
        content: status?.hasX && status?.hasY
          ? `✅ You have ${status.xCount} X and ${status.yCount} Y variable(s). XY Pair format pairs each X with its corresponding Y (X1 with Y1, X2 with Y2, etc.).`
          : `XY Pair format requires equal numbers of X and Y variables. Each X is paired with its corresponding Y variable.`,
        icon: status?.hasX && status?.hasY ? "success" : "info"
      };
    }

    if (formatLower.includes('x many y') || formatLower.includes('many y')) {
      return {
        title: `📊 X Many Y Format Requirements`,
        content: status?.hasX && status?.hasY
          ? `✅ You have ${status.xCount} X and ${status.yCount} Y variable(s). This format creates ${status.yCount} series, each plotted against the X variable(s).`
          : `X Many Y format requires X variables and multiple Y variables. Each Y variable creates a separate series.`,
        icon: status?.hasX && status?.hasY ? "success" : "info"
      };
    }

    if (formatLower.includes('y many x')) {
      return {
        title: `📊 Y Many X Format Requirements`,
        content: status?.hasX && status?.hasY
          ? `✅ You have ${status.xCount} X and ${status.yCount} Y variable(s). This format creates ${status.xCount} series, each plotted against the Y variable(s).`
          : `Y Many X format requires multiple X variables and Y variables. Each X variable creates a separate series.`,
        icon: status?.hasX && status?.hasY ? "success" : "info"
      };
    }

    // 3D Formats
    if (formatLower.includes('xyz') || formatLower.includes('triplet')) {
      return {
        title: `📊 XYZ Triplets Format Requirements`,
        content: status?.hasX && status?.hasY && status?.hasZ
          ? `✅ You have X (${status.xCount}), Y (${status.yCount}), and Z (${status.zCount}) variables. Each triplet represents a 3D point.`
          : `XYZ Triplets format requires equal numbers of X, Y, and Z variables. Each triplet (X, Y, Z) represents one 3D point.`,
        icon: status?.hasX && status?.hasY && status?.hasZ ? "success" : "info"
      };
    }

    if (formatLower.includes('many z')) {
      return {
        title: `📊 Many Z Format Requirements`,
        content: status?.hasZ
          ? `✅ You have ${status.zCount} Z variable(s) selected. Many Z format creates a 3D surface from multiple Z value columns.`
          : `Many Z format requires multiple Z variables. Each Z variable represents height values at grid points.`,
        icon: status?.hasZ ? "success" : "info"
      };
    }

    return null;
  };

  /**
   * Extract error bar type from error messages
   */
  const getErrorBarTypeFromErrors = (errors: ValidationError[]): string => {
    const messages = errors.map(e => e.message.toLowerCase()).join(' ');
    if (messages.includes('bidirectional')) return 'Bidirectional';
    if (messages.includes('horizontal')) return 'Horizontal';
    if (messages.includes('vertical')) return 'Vertical';
    if (messages.includes('asymmetric')) return 'Asymmetric';
    return 'Error bar';
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
              {defaultTitle}
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

            {/* Smart Help Section */}
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
                  <MdInfo size={20} color={tokens.colorBrandForeground1} />
                  <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>
                    💡 Smart Help - What You Need To Know
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
