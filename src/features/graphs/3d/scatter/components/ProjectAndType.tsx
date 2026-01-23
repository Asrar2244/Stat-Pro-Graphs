import { FC } from 'react';
import { Field, Dropdown, Option, tokens } from '@fluentui/react-components';

/**
 * Props for the ProjectAndType component
 */
interface ProjectAndTypeProps {
    classes: Record<string, string>;
    projects: string[];
    selectedProject: string | null;
    setProject: (p: string) => void;
}

/**
 * Component for selecting project and 3D scatter plot type
 */
export const ProjectAndType: FC<ProjectAndTypeProps> = ({
    classes,
    projects,
    selectedProject,
    setProject,
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

        </div>
    );
};
