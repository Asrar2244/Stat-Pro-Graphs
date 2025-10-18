import { FC } from 'react';
import { Field, Dropdown, Option, tokens } from '@fluentui/react-components';
import type { LineScatterSubType } from '../lineScatterPlotSlice';

/**
 * Props for the ProjectAndType component
 */
interface ProjectAndTypeProps {
  classes: Record<string, string>;
  projects: string[];
  selectedProject: string | null;
  setProject: (p: string) => void;
  subType: LineScatterSubType | null;
  setSubType: (t: LineScatterSubType) => void;
  subTypes: LineScatterSubType[];
}

/**
 * Component for selecting project and line-scatter plot type
 */
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

      <Field label="Line-Scatter Plot Type" required>
        <style>{`
          .plotTypeDropdown .fui-Listbox { max-height: 216px; overflow-y: auto; }
        `}</style>
        <Dropdown
          placeholder="Choose a plot type..."
          value={subType ?? ''}
          onOptionSelect={(_, data) => setSubType(data.optionValue as LineScatterSubType)}
          className={`${classes.dropdown} plotTypeDropdown`}
        >
          {subTypes.map((type) => (
            <Option key={type} value={type} text={type}>
              {type}
            </Option>
          ))}
        </Dropdown>
      </Field>
    </div>
  );
};