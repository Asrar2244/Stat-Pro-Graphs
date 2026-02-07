import { FC } from 'react';
import { Field, Dropdown, Option, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { availableComputers } from '../computers';
import { AnalyticsType } from '../computers/types';
import { useAnalyticsStore } from '../store/analyticsSlice';

interface AnalyticsHeaderProps {
    projects: string[];
    selectedProject: string | undefined;
    onProjectChange: (project: string) => void;
    subType: AnalyticsType | undefined;
    onSubTypeChange: (type: AnalyticsType) => void;
}

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px',
        ...shorthands.padding('16px'),
        backgroundColor: tokens.colorNeutralBackground2,
        ...shorthands.borderRadius('4px'),
        border: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    row: {
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
    },
    field: {
        flex: 1,
        minWidth: '250px',
    },
    description: {
        fontSize: '12px',
        color: tokens.colorNeutralForeground2,
        marginTop: '4px',
        fontStyle: 'italic',
    }
});

export const AnalyticsHeader: FC<AnalyticsHeaderProps> = ({
    projects,
    selectedProject,
    onProjectChange,
    subType,
    onSubTypeChange
}) => {
    const styles = useStyles();
    const { dataFormat, setDataFormat } = useAnalyticsStore();

    const selectedComputer = subType ? availableComputers.find(c => c.type === subType) : undefined;

    return (
        <div className={styles.container}>
            <div className={styles.row}>
                <Field label="Project" required className={styles.field}>
                    <Dropdown
                        placeholder="Select Project..."
                        value={selectedProject || ''}
                        onOptionSelect={(_, data) => onProjectChange(data.optionValue || '')}
                    >
                        {projects.map((p) => (
                            <Option key={p} value={p}>{p}</Option>
                        ))}
                    </Dropdown>
                </Field>

                <Field label="Analysis Type" required className={styles.field}>
                    <Dropdown
                        placeholder="Select Analysis..."
                        value={selectedComputer?.displayName || ''}
                        onOptionSelect={(_, data) => {
                            const type = data.optionValue as AnalyticsType;
                            onSubTypeChange(type);
                        }}
                    >
                        {availableComputers.map((comp) => (
                            <Option key={comp.type} value={comp.type} text={comp.displayName}>
                                {comp.displayName}
                            </Option>
                        ))}
                    </Dropdown>
                </Field>

                {(subType === 'ROC_CURVE') && (
                    <Field label="Data Format" required className={styles.field}>
                        <Dropdown
                            value={dataFormat}
                            onOptionSelect={(_, data) => setDataFormat(data.optionValue as any)}
                        >
                            <Option key="XY Pairs" value="XY Pairs">XY Pairs</Option>
                            <Option key="X Many Y" value="X Many Y">X Many Y</Option>
                        </Dropdown>
                    </Field>
                )}
            </div>

            {selectedComputer && (
                <div className={styles.description}>
                    {selectedComputer.description}
                </div>
            )}
        </div>
    );
};
