import { FC } from 'react';
import { Field, Dropdown, Option, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle } from 'react-icons/md';
import type { DataFormat } from '../areaPlotSlice';
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
                                {format === 'XY Pair' && <MdCheckCircle size={16} color={tokens.colorBrandForeground1} />}
                                {format === 'Single Y' && <MdCheckCircle size={16} color={tokens.colorPaletteGreenForeground1} />}
                                {format === 'Single X' && <MdCheckCircle size={16} color={tokens.colorPaletteRedForeground1} />}
                                {format === 'XY Pairs' && <MdCheckCircle size={16} color={tokens.colorBrandForeground1} />}
                                {format === 'X Many Y' && <MdCheckCircle size={16} color={tokens.colorPaletteGreenForeground1} />}
                                {format === 'Y Many X' && <MdCheckCircle size={16} color={tokens.colorPaletteRedForeground1} />}
                                {format === 'Many X' && <MdCheckCircle size={16} color={tokens.colorNeutralForeground2} />}
                                {format === 'Many Y' && <MdCheckCircle size={16} color={tokens.colorNeutralForeground2} />}
                                {format === 'YX Pair' && <MdCheckCircle size={16} color={tokens.colorPalettePurpleForeground2} />}
                                {format === 'YX Pairs' && <MdCheckCircle size={16} color={tokens.colorPalettePurpleForeground2} />}
                                {format}
                            </div>
                        </Option>
                    ))}
                </Dropdown>
                <div style={descriptionTextStyles}>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                        {(() => {
                            switch (dataFormat) {
                                case 'XY Pair':
                                    return 'Requires one X column and one Y column.';
                                case 'XY Pairs':
                                    return 'Requires paired X and Y columns. At least one pair.';
                                case 'X Many Y':
                                    return 'Requires one X column and multiple Y columns.';
                                case 'Y Many X':
                                    return 'Requires one Y column and multiple X columns.';
                                case 'Many X':
                                    return 'Requires multiple X columns; Y is assumed (index).';
                                case 'Many Y':
                                    return 'Requires multiple Y columns; X is assumed (index).';
                                case 'Single X':
                                    return 'Requires one X column (plotted against index).';
                                case 'Single Y':
                                    return 'Requires one Y column (plotted against index).';
                                case 'YX Pair':
                                    return 'Requires one Y column and one X column (Vertical orientation).';
                                case 'YX Pairs':
                                    return 'Requires paired Y and X columns (Vertical orientation).';
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
