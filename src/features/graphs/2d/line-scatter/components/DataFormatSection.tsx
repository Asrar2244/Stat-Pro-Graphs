import { FC } from 'react';
import { Field, Dropdown, Option, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle } from 'react-icons/md';
import type { DataFormat } from '../lineScatterPlotSlice';
import { useDataFormatSectionStyles } from '../styles-hook';

/**
 * Props for the DataFormatSection component
 */
interface DataFormatSectionProps {
  classes: Record<string, string>;
  dataFormat: DataFormat | null;
  setDataFormat: (f: DataFormat) => void;
  availableFormats: DataFormat[];
}

/**
 * Component for selecting data format with descriptions for each format
 */
export const DataFormatSection: FC<DataFormatSectionProps> = ({
  classes,
  dataFormat,
  setDataFormat,
  availableFormats,
}) => {
  const { optionDisplayStyles, descriptionTextStyles } = useDataFormatSectionStyles();
  return (
    <div className={classes.simpleCard}>
      <Field label="Data Format" required>
        <Dropdown
          placeholder="Choose data format..."
          value={dataFormat ?? ''}
          onOptionSelect={(_, data) => setDataFormat(data.optionValue as DataFormat)}
          className={classes.dropdown}
        >
          {availableFormats.map((format) => (
            <Option key={format} value={format} text={format}>
              <div style={optionDisplayStyles}>
                {/* Basic formats */}
                {format === 'XY Pairs' && <MdCheckCircle size={16} color={tokens.colorBrandForeground1} />}
                {format === 'Single X' && <MdCheckCircle size={16} color={tokens.colorPaletteRedForeground1} />}
                {format === 'Single Y' && <MdCheckCircle size={16} color={tokens.colorPaletteGreenForeground1} />}
                
                {/* Multiple formats */}
                {format === 'X Many Y' && <MdCheckCircle size={16} color={tokens.colorPaletteGreenForeground1} />}
                {format === 'Y Many X' && <MdCheckCircle size={16} color={tokens.colorPaletteRedForeground1} />}
                {format === 'Many X' && <MdCheckCircle size={16} color={tokens.colorNeutralForeground2} />}
                {format === 'Many Y' && <MdCheckCircle size={16} color={tokens.colorNeutralForeground2} />}
                
                {/* Category formats */}
                {format === 'X Category' && <MdCheckCircle size={16} color={tokens.colorPalettePurpleForeground2} />}
                {format === 'Y Category' && <MdCheckCircle size={16} color={tokens.colorPalettePurpleForeground2} />}
                
                {format}
              </div>
            </Option>
          ))}
        </Dropdown>
        <div style={descriptionTextStyles}>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            {(() => {
              switch (dataFormat) {
                case 'XY Pairs':
                  return 'Requires paired X and Y columns (X[i] with Y[i]). Multiple pairs.';
                case 'Single X':
                  return 'Requires at least one X column (plotted against index).';
                case 'Single Y':
                  return 'Requires at least one Y column (plotted against index).';
                case 'Many X':
                  return 'Requires at least one X column; Y is assumed (index).';
                case 'Many Y':
                  return 'Requires at least one Y column; X is assumed (index).';
                case 'X Many Y':
                  return 'Requires one X column and at least one Y column.';
                case 'Y Many X':
                  return 'Requires one Y column and at least one X column.';
                case 'X Category':
                  return 'Requires one X column and a category column (grouping).';
                case 'Y Category':
                  return 'Requires one Y column and a category column (grouping).';
                default:
                  return '';
              }
            })()}
          </Text>
        </div>
      </Field>
    </div>
  );
};