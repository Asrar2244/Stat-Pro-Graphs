import { FC } from 'react';
import { Dropdown, Field, Option, tokens } from '@fluentui/react-components';
import { useLineScatterPlotStore } from '../lineScatterPlotSlice';
import type { SymbolValueOption, ErrorCalculationOption } from '../lineScatterPlotSlice';
import { useErrorBarsConfigurationStyles } from '../styles-hook';

/**
 * Props for the ErrorBarsConfiguration component
 */
interface ErrorBarsConfigurationProps {
  subType?: string;
  symbolValue?: SymbolValueOption;
  errorCalculationUpper?: ErrorCalculationOption;
  errorCalculationLower?: ErrorCalculationOption;
  onSymbolValueChange: (value: SymbolValueOption | undefined) => void;
  onErrorCalculationUpperChange: (value: ErrorCalculationOption | undefined) => void;
  onErrorCalculationLowerChange: (value: ErrorCalculationOption | undefined) => void;
}

const SYMBOL_VALUE_OPTIONS: SymbolValueOption[] = [
  'Worksheet Columns',
  'Asymmetric Error Bar',
  'Column Means',
  'Row Means',
  'By Category Mean',
  'Column Median',
  'Row Median',
  'By Category Median',
  'First Column Entry',
  'First Row Entry',
  'Last Column Entry',
  'Last Row Entry'
];

const ERROR_CALCULATION_OPTIONS: ErrorCalculationOption[] = [
  'Mean',
  'Median',
  'Standard Deviation',
  '2 Standard Deviations',
  '3 Standard Deviations',
  'Standard Error',
  '2 Standard Errors',
  '3 Standard Errors',
  '95% Confidence',
  '99% Confidence',
  '95% Prediction Interval',
  '99% Prediction Interval',
  '95% Tolerance Interval',
  '99% Tolerance Interval',
  'Robust Standard Deviation',
  '2 Robust Standard Deviations',
  'Interquartile Range',
  '1.5 IQR',
  '75th Percentile',
  '90th Percentile',
  '95th Percentile',
  '99th Percentile',
  'Maximum',
  'Minimum',
  'Range',
  'Last Entry',
  'First Entry',
  'Dynamic (Data-driven)',
  'None'
];

/**
 * Component for configuring error bars in line-scatter plots
 */
export const ErrorBarsConfiguration: FC<ErrorBarsConfigurationProps> = ({
  subType,
  symbolValue,
  errorCalculationUpper,
  errorCalculationLower,
  onSymbolValueChange,
  onErrorCalculationUpperChange,
  onErrorCalculationLowerChange
}) => {
  const { containerStyles, headerStyles } = useErrorBarsConfigurationStyles();

  // Determine if error calculation dropdowns should be shown
  const shouldShowErrorCalculation = symbolValue && 
    symbolValue !== 'Worksheet Columns' && 
    symbolValue !== 'Asymmetric Error Bar';

  return (
    <div style={containerStyles}>
      <h3 style={headerStyles}>Error Bars Configuration</h3>
      <Field label="Symbol Value (Main Dropdown)" required>
        <Dropdown
          placeholder="Select symbol value option"
          value={symbolValue}
          selectedOptions={symbolValue ? [symbolValue] : []}
          onOptionSelect={(_, data) => {
            if (data.optionValue) {
              onSymbolValueChange(data.optionValue as SymbolValueOption);
            }
          }}
        >
          {SYMBOL_VALUE_OPTIONS.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Dropdown>
      </Field>

      {shouldShowErrorCalculation && (
        <>
          <Field label="Error Calculation (Upper)" required>
            <Dropdown
              placeholder="Select upper error calculation"
              value={errorCalculationUpper}
              selectedOptions={errorCalculationUpper ? [errorCalculationUpper] : []}
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  onErrorCalculationUpperChange(data.optionValue as ErrorCalculationOption);
                }
              }}
            >
              {ERROR_CALCULATION_OPTIONS.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Dropdown>
          </Field>

          <Field label="Error Calculation (Lower)" required>
            <Dropdown
              placeholder="Select lower error calculation"
              value={errorCalculationLower}
              selectedOptions={errorCalculationLower ? [errorCalculationLower] : []}
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  onErrorCalculationLowerChange(data.optionValue as ErrorCalculationOption);
                }
              }}
            >
              {ERROR_CALCULATION_OPTIONS.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Dropdown>
          </Field>
        </>
      )}
    </div>
  );
};