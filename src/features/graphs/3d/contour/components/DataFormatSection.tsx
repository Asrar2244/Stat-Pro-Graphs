import { FC } from 'react';
import { Field, Dropdown, Option, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle } from 'react-icons/md';
import type { DataFormat } from '../contourPlotSlice';
import { useDataFormatSectionStyles } from '../styles-hook/use-data-format-section-styles';

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
                                {format === 'XYZ Triplets' && <MdCheckCircle size={16} color={tokens.colorBrandForeground1} />}
                                {format === 'Many Z' && <MdCheckCircle size={16} color={tokens.colorPaletteGreenForeground1} />}
                                {format === 'XY Many Z' && <MdCheckCircle size={16} color={tokens.colorPaletteBlueForeground2} />}
                                {format}
                            </div>
                        </Option>
                    ))}
                </Dropdown>
                <div style={descriptionTextStyles}>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                        {(() => {
                            switch (dataFormat) {
                                case 'XYZ Triplets':
                                    return 'Requires one X column, one Y column, and one Z column for contour plotting.';
                                case 'Many Z':
                                    return 'Requires multiple Z columns. X and Y scales are automatically generated (10,20,30... and 1,2,3...).';
                                case 'XY Many Z':
                                    return 'Requires one X column, one Y column, and multiple Z columns.';
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
