import { FC } from 'react';
import { Dropdown, Field, Option, tokens } from '@fluentui/react-components';
import { useLinePlotStore } from '../linePlotSlice';
import type { SymbolValueOption, ErrorCalculationOption } from '../linePlotSlice';
import { useErrorBarsConfigurationStyles } from '../styles-hook';

/**
 * Props for the ErrorBarsConfiguration component
 */
interface ErrorBarsConfigurationProps {
  errorBarVariableList?: Map<string, boolean>;
  setErrorBarVariableList?: (list: Map<string, boolean>) => void;
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
 * Component for configuring error bars in scatter plots
 */
export const ErrorBarsConfiguration: FC<ErrorBarsConfigurationProps> = ({ 
  errorBarVariableList, 
  setErrorBarVariableList 
}) => {
  const {
    symbolValue,
    errorCalculationUpper,
    errorCalculationLower,
    errorBarVariable,
    availableVariables,
    setSymbolValue,
    setErrorCalculationUpper,
    setErrorCalculationLower,
    setErrorBarVariable
  } = useLinePlotStore();

  const { containerStyles, headerStyles } = useErrorBarsConfigurationStyles();

  // Determine if error bar variable selection should be shown
  const showErrorBarVariable = false; // Disabled error bar variable dropdown

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
              setSymbolValue(data.optionValue as SymbolValueOption);
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

      {showErrorBarVariable && (
        <Field label="Error Bar Variable" required>
          <Dropdown
            placeholder="Select error bar variable"
            value={errorBarVariable}
            selectedOptions={errorBarVariable ? [errorBarVariable] : []}
            onOptionSelect={(_, data) => {
              if (data.optionValue) {
                // Only update the direct errorBarVariable (legacy support)
                // Don't interfere with the errorBarVariableList managed by VariableSelection
                setErrorBarVariable(data.optionValue);
              }
            }}
          >
            {availableVariables.map((variable) => (
              <Option key={variable.name} value={variable.name}>
                {variable.name}
              </Option>
            ))}
          </Dropdown>
        </Field>
      )}

      {shouldShowErrorCalculation && (
        <>
          <Field label="Error Calculation – Upper" required>
            <Dropdown
              placeholder="Select upper error calculation"
              value={errorCalculationUpper}
              selectedOptions={errorCalculationUpper ? [errorCalculationUpper] : []}
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  setErrorCalculationUpper(data.optionValue as ErrorCalculationOption);
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

          <Field label="Error Calculation – Lower" required>
            <Dropdown
              placeholder="Select lower error calculation"
              value={errorCalculationLower}
              selectedOptions={errorCalculationLower ? [errorCalculationLower] : []}
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  setErrorCalculationLower(data.optionValue as ErrorCalculationOption);
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
