import { FC } from 'react';
import { Field, Dropdown, Option } from '@fluentui/react-components';
import { BoxPlotSubType } from '../types';

interface ProjectAndTypeProps {
    classes: Record<string, string>;
    projects: string[];
    selectedProject: string | null;
    setProject: (p: string) => void;
    subType: BoxPlotSubType | null;
    setSubType: (t: BoxPlotSubType) => void;
    subTypes: BoxPlotSubType[];
}

export const ProjectAndType: FC<ProjectAndTypeProps> = ({
    classes,
    projects,
    selectedProject,
    setProject,
    subType,
    setSubType,
    subTypes,
}) => {
    return (
        <div className={classes.projectSection}>
            <Field label="Project" required>
                <Dropdown
                    placeholder="Choose a project..."
                    value={selectedProject ?? ''}
                    onOptionSelect={(_, data) => setProject(data.optionValue ?? '')}
                >
                    {projects.map((project) => (
                        <Option key={project} value={project} text={project}>
                            {project}
                        </Option>
                    ))}
                </Dropdown>
            </Field>

            <Field label="Box Plot Type" required>
                <Dropdown
                    placeholder="Select plot type..."
                    value={subType ?? ''}
                    onOptionSelect={(_, data) => setSubType(data.optionValue as BoxPlotSubType)}
                >
                    {subTypes.map((type) => (
                        <Option key={type} value={type}>
                            {type}
                        </Option>
                    ))}
                </Dropdown>
            </Field>
        </div>
    );
};
