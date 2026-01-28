import { FC } from 'react';
import { Field, Dropdown, Option, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle } from 'react-icons/md';
import type { DataFormat } from '../types';
import { useDataFormatSectionStyles } from '../styles-hook';

interface DataFormatSectionProps {
    classes: Record<string, string>;
    dataFormat: DataFormat | undefined;
    setDataFormat: (f: DataFormat) => void;
    availableFormats: DataFormat[];
}

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
                                <MdCheckCircle size={16} color={tokens.colorBrandForeground1} />
                                {format}
                            </div>
                        </Option>
                    ))}
                </Dropdown>
                <div style={descriptionTextStyles}>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                        {/* Descriptions could be added here similar to scatter if needed */}
                        Select the data format matching your data layout.
                    </Text>
                </div>
            </Field>
        </div>
    );
};
