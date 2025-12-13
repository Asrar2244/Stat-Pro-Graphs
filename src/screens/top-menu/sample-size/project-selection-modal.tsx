import { FC } from 'react';
import { Modal } from '@libs';
import { useStartProStore } from '@store/main-store';
import { useShallow } from 'zustand/react/shallow';
import { makeStyles, tokens, Text } from '@fluentui/react-components';
import { AiFillFileExcel } from 'react-icons/ai';

const useStyles = makeStyles({
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '16px',
  },
  projectItem: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '&:hover': {
      background: tokens.colorNeutralBackground1Hover,
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
  },
  projectIcon: {
    fontSize: '28px',
    color: tokens.colorBrandForeground1,
  },
  projectInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  projectName: {
    fontWeight: '600',
    fontSize: '16px',
    color: tokens.colorNeutralForeground1,
    lineHeight: '1.4',
  },
  projectFile: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  noProjects: {
    padding: '32px',
    textAlign: 'center',
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
});

interface ProjectSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectProject: (projectId: number, projectName: string) => void;
}

export const ProjectSelectionModal: FC<ProjectSelectionModalProps> = ({
  open,
  onClose,
  onSelectProject,
}) => {
  const classes = useStyles();
  const { projects } = useStartProStore(
    useShallow((state) => ({
      projects: state.projects,
    }))
  );

  // Get project names (keys) just like the explorer does
  const projectNames = Object.keys(projects);

  const handleSelectProject = (projectId: number, projectName: string) => {
    onSelectProject(projectId, projectName);
    onClose();
  };

  // Debug logging
  console.log('[ProjectSelectionModal] Projects:', projectNames.map(name => ({ name, id: projects[name]?.id })));

  return (
    <Modal
      open={open}
      closeModal={onClose}
      toggleModal={onClose}
      openModal={() => {}}
      title="Select Project to Save Report"
      size="medium"
      showCancel
      cancelLabel="Cancel"
      showOk={false}
    >
      <div className={classes.projectList}>
        {projectNames.length > 0 ? (
          projectNames.map((projectName) => {
            const project = projects[projectName];
            return (
              <div
                key={project.id}
                className={classes.projectItem}
                onClick={() => handleSelectProject(Number(project.id), projectName)}
              >
                <AiFillFileExcel className={classes.projectIcon} />
                <div className={classes.projectInfo}>
                  <Text className={classes.projectName}>{projectName}</Text>
                  <Text className={classes.projectFile}>{project.inputFileName}</Text>
                </div>
              </div>
            );
          })
        ) : (
          <div className={classes.noProjects}>
            <Text>No projects available. Please open a project first.</Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

