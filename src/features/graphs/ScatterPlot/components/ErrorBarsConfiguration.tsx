import React, { FC } from 'react';
import { Dropdown, Field, Option, tokens } from '@fluentui/react-components';
import { useScatterPlotStore } from '../scatterPlotSlice';
import type { SymbolValueOption, ErrorCalculationOption } from '../scatterPlotSlice';

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
  } = useScatterPlotStore();

  console.log('🔍 ErrorBarsConfiguration rendered with:', { symbolValue, errorBarVariable, availableVariables: availableVariables.length });

  // Determine if error bar variable selection should be shown
  const showErrorBarVariable = false; // Disabled error bar variable dropdown
  console.log('🔍 showErrorBarVariable:', showErrorBarVariable, 'symbolValue:', symbolValue);

  // Determine if error calculation dropdowns should be shown
  const showErrorCalculation = symbolValue && 
    symbolValue !== 'Worksheet Columns' && 
    symbolValue !== 'Asymmetric Error Bar';

  return (
    <div style={{ 
      marginBottom: tokens.spacingVerticalS,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderRadius: tokens.borderRadiusMedium,
      padding: tokens.spacingVerticalS,
      backgroundColor: tokens.colorNeutralBackground1,
      boxShadow: tokens.shadow2
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: tokens.spacingVerticalS,
        color: tokens.colorNeutralForeground1,
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold
      }}>Error Bars Configuration</h3>
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
              if (data.optionValue && setErrorBarVariableList) {
                // Update both the direct errorBarVariable and the errorBarVariableList
                setErrorBarVariable(data.optionValue);
                
                // Update the errorBarVariableList to match
                const newErrorBarList = new Map<string, boolean>();
                newErrorBarList.set(data.optionValue, true);
                setErrorBarVariableList(newErrorBarList);
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

      {showErrorCalculation && (
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
