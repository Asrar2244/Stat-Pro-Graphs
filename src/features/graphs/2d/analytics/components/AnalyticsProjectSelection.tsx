import { FC } from 'react';
import { Field, Dropdown, Option, makeStyles, shorthands } from '@fluentui/react-components';

interface AnalyticsProjectSelectionProps {
    projects: string[];
    selectedProject: string | undefined;
    onProjectChange: (project: string) => void;
}

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px',
        ...shorthands.padding('16px'),
        backgroundColor: '#fafafa', // Light background to separate it
        ...shorthands.borderRadius('4px'),
        border: '1px solid #e0e0e0',
    },
    dropdown: {
        minWidth: '300px',
    }
});

export const AnalyticsProjectSelection: FC<AnalyticsProjectSelectionProps> = ({
    projects,
    selectedProject,
    onProjectChange
}) => {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <Field label="Select Workspace Project" required>
                <Dropdown
                    placeholder="Choose a project..."
                    value={selectedProject || ''}
                    onOptionSelect={(_, data) => onProjectChange(data.optionValue || '')}
                    className={styles.dropdown}
                >
                    {projects.map((p) => (
                        <Option key={p} value={p}>{p}</Option>
                    ))}
                </Dropdown>
            </Field>
        </div>
    );
};
