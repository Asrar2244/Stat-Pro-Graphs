import { FC } from 'react';
import { Field, Dropdown, Option, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle } from 'react-icons/md';
import type { DataFormat } from '../scatterPlotSlice';

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
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
                {format === 'XY Pair' && <MdCheckCircle size={16} color={tokens.colorBrandForeground1} />}
                {format === 'Single Y' && <MdCheckCircle size={16} color={tokens.colorPaletteGreenForeground1} />}
                {format === 'Single X' && <MdCheckCircle size={16} color={tokens.colorPaletteRedForeground1} />}
                {format === 'XY Pairs' && <MdCheckCircle size={16} color={tokens.colorBrandForeground1} />}
                {format === 'X Many Y' && <MdCheckCircle size={16} color={tokens.colorPaletteGreenForeground1} />}
                {format === 'Y Many X' && <MdCheckCircle size={16} color={tokens.colorPaletteRedForeground1} />}
                {format === 'Many X' && <MdCheckCircle size={16} color={tokens.colorNeutralForeground2} />}
                {format === 'Many Y' && <MdCheckCircle size={16} color={tokens.colorNeutralForeground2} />}
                {format === 'XY Category' && <MdCheckCircle size={16} color={tokens.colorNeutralForeground2} />}
                {format === 'X Category' && <MdCheckCircle size={16} color={tokens.colorNeutralForeground2} />}
                {format === 'Y Category' && <MdCheckCircle size={16} color={tokens.colorNeutralForeground2} />}
                {format === 'X Single Y Replicate' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                {format === 'Y Replicate' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                {format === 'X Many Y Replicates' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                {format === 'Many Y Replicates' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                {format === 'Y Many X Replicates' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                {format === 'Many X Replicates' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                {format === 'X Replicates' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                {format === 'Y Single X Replicates' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                {format === 'Y Many X Replicates' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                {format === 'YX Pairs' && <MdCheckCircle size={16} color={tokens.colorPalettePurpleForeground2} />}
                {format === 'Category Many Y' && <MdCheckCircle size={16} color={tokens.colorPalettePurpleForeground2} />}
                {format === 'Category Many X' && <MdCheckCircle size={16} color={tokens.colorPalettePurpleForeground2} />}
                {format}
              </div>
            </Option>
          ))}
        </Dropdown>
        <div style={{ marginTop: tokens.spacingVerticalXS }}>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            {(() => {
              switch (dataFormat) {
                case 'XY Pair':
                  return 'Requires at least one X column and one Y column.';
                case 'XY Pairs':
                  return 'Requires paired X and Y columns (X[i] with Y[i]). At least one pair.';
                case 'X Many Y':
                  return 'Requires one X column and at least one Y column.';
                case 'Y Many X':
                  return 'Requires one Y column and at least one X column.';
                case 'Many X':
                  return 'Requires at least one X column; Y is assumed (index).';
                case 'Many Y':
                  return 'Requires at least one Y column; X is assumed (index).';
                case 'XY Category':
                  return 'Requires one X column, one Y column, and a category column (grouping).';
                case 'X Category':
                  return 'Requires one X column and a category column (grouping).';
                case 'Y Category':
                  return 'Requires one Y column and a category column (grouping).';
                case 'Single X':
                  return 'Requires at least one X column (plotted against index).';
                case 'Single Y':
                  return 'Requires at least one Y column (plotted against index).';
                case 'X Single Y Replicate':
                  return 'Requires one X column, one Y column, and replicate data.';
                case 'Y Replicate':
                  return 'Requires at least one Y column with replicate data.';
                case 'X Many Y Replicates':
                  return 'Requires one X column and multiple Y columns with replicate data.';
                case 'Many Y Replicates':
                  return 'Requires multiple Y columns with replicate data.';
                case 'Y Many X Replicates':
                  return 'Requires one Y column and multiple X columns with replicate data.';
                case 'Many X Replicates':
                  return 'Requires multiple X columns with replicate data.';
                case 'X Replicates':
                  return 'Requires at least one X column with replicate data.';
                case 'Y Single X Replicates':
                  return 'Requires one Y column, one X column, and replicate data.';
                case 'Y Many X Replicates':
                  return 'Requires one Y column and multiple X columns with replicate data.';
                case 'YX Pairs':
                  return 'Requires paired Y and X columns (Y[i] with X[i]).';
                case 'Category Many Y':
                  return 'Requires a category column and multiple Y columns.';
                case 'Category Many X':
                  return 'Requires a category column and multiple X columns.';
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