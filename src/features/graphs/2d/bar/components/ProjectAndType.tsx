import { FC } from 'react';
import { Field, Dropdown, Option } from '@fluentui/react-components';
import { BarPlotSubType } from '../types';

interface ProjectAndTypeProps {
    classes: Record<string, string>;
    projects: string[];
    selectedProject: string | null;
    setProject: (p: string) => void;
    subType: BarPlotSubType | undefined;
    setSubType: (t: BarPlotSubType) => void;
    subTypes: BarPlotSubType[];
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
        <div className={classes.sectionCard}>
            <Field label="Project" required>
                <style>{`
          .projectDropdown .fui-Listbox { max-height: 216px; overflow-y: auto; }
        `}</style>
                <Dropdown
                    placeholder="Choose a project..."
                    value={selectedProject ?? ''}
                    onOptionSelect={(_, data) => setProject(data.optionValue ?? '')}
                    className={`${classes.dropdown} projectDropdown`}
                >
                    {projects.map((project) => (
                        <Option key={project} value={project} text={project}>
                            {project}
                        </Option>
                    ))}
                </Dropdown>
            </Field>

            <Field label="Bar Plot Type" required>
                <Dropdown
                    placeholder="Select plot type..."
                    value={subType ?? ''}
                    onOptionSelect={(_, data) => setSubType(data.optionValue as BarPlotSubType)}
                    className={classes.dropdown}
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
