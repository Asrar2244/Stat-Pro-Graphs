import { FC } from 'react';
import { Field, Dropdown, Option, Text, tokens } from '@fluentui/react-components';
import { MdCheckCircle } from 'react-icons/md';
import { DataFormat } from '../types';

interface DataFormatSectionProps {
    classes: Record<string, string>;
    dataFormat: DataFormat | null;
    setDataFormat: (f: DataFormat) => void;
    availableFormats: DataFormat[];
}

export const DataFormatSection: FC<DataFormatSectionProps> = ({
    classes,
    dataFormat,
    setDataFormat,
    availableFormats,
}) => {

    const getFormatDescription = (format: DataFormat | null) => {
        switch (format) {
            case 'Many Y':
                return 'Plots multiple Y variables as separate boxes. X axis is just an index/sequence.';
            case 'X Many Y':
                return 'Plots multiple Y variables grouped by a shared X variable.';
            case 'Many X':
                return 'Plots multiple X variables as separate horizontal boxes. Y axis is just an index/sequence.';
            case 'Y Many X':
                return 'Plots multiple X variables grouped by a shared Y variable.';
            default:
                return '';
        }
    };

    return (
        <div className={classes.dataFormatSection}>
            <Text className={classes.sectionTitle} weight="semibold">Data Format Configuration</Text>
            <Field label="Data Format" required>
                <Dropdown
                    placeholder="Choose data format..."
                    value={dataFormat ?? ''}
                    onOptionSelect={(_, data) => setDataFormat(data.optionValue as DataFormat)}
                >
                    {availableFormats.map((format) => (
                        <Option key={format} value={format} text={format}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MdCheckCircle size={16} color={tokens.colorBrandForeground1} />
                                {format}
                            </div>
                        </Option>
                    ))}
                </Dropdown>
                <div style={{ marginTop: '8px' }}>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                        {getFormatDescription(dataFormat)}
                    </Text>
                </div>
            </Field>
        </div>
    );
};
