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
    contourType: 'contour' | 'filled';
    setContourType: (t: 'contour' | 'filled') => void;
}

/**
 * Component for selecting project for Contour plot
 */
export const ProjectAndType: FC<ProjectAndTypeProps> = ({
    classes,
    projects,
    selectedProject,
    setProject,
    contourType,
    setContourType,
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

            <Field label="Contour Plot Type" required>
                <Dropdown
                    value={contourType === 'contour' ? 'Contour (Outlines)' : 'Filled Contour'}
                    onOptionSelect={(_, data) => setContourType(data.optionValue as 'contour' | 'filled')}
                    className={classes.dropdown}
                >
                    <Option value="contour" text="Contour (Outlines)">Contour (Outlines)</Option>
                    <Option value="filled" text="Filled Contour">Filled Contour</Option>
                </Dropdown>
            </Field>
        </div>
    );
};
