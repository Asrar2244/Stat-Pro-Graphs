import { FC, memo, useRef, useCallback, useState } from 'react';
import {
  Tree,
  TreeItem,
  TreeItemLayout,
  Caption2,
  Caption1,
  Text,
} from '@fluentui/react-components';
import { useShallow } from 'zustand/react/shallow';
import { AiFillFileExcel, AiFillControl } from 'react-icons/ai';
import { CONFIGURATION_DB, DATA, OUTPUT, API } from '@constants';
import { useTranslation } from 'react-i18next';
import { updateOutputFromProject, updateDataFromProject, deleteProject } from '@backend';
import { Modal, RecordNotFound } from '@libs';
import { useGetInitialConfig, useFileSize, useFormatter, useNodeActions, useModal } from '@hooks';
import { useStartProStore, IProjectDetails } from '@store';
import { useExplorerLayout } from './styles-hook/use-explorer-style';
import { Database } from '@utils';
import { mainWorker } from '@workers/worker';
import { MdDeleteOutline } from 'react-icons/md';

export interface ISelector extends IProjectDetails {
  projectName: string;
  isEmptyDataView?: boolean;
}
const ExplorerComp: FC = () => {
  const classes = useExplorerLayout();
  const { mb } = useFileSize();
  const { dateFormat } = useFormatter();
  const { getConfigurations } = useGetInitialConfig();
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const { projects, setBlockUI, deleteProject: deleteProjectFromStore } = useStartProStore(
    useShallow((state) => ({
      projects: state.projects,
      model: state.model,
      setBlockUI: state.setBlockUI,
      deleteProject: state.deleteProject,
    })),
  );

  const { selectTab, openNewTab, getOpenRecords } = useNodeActions();
  const { t } = useTranslation('workspace');
  const [projectToDelete, setProjectToDelete] = useState<{ name: string, id: string } | null>(null);
  const deleteModal = useModal({ initialOpen: false });

  const onSelectedUpdate = (data: ISelector, type: string) => (): void => {
    const { record } = getOpenRecords(data, type);
    if (record) {
      selectTab(`${type}-${data.id}`);
    }
    let query = '';
    switch (type) {
      case DATA:
        query = updateDataFromProject;
        break;
      case OUTPUT:
        query = updateOutputFromProject;
        break;
      default:
        setBlockUI({ value: true, msg: t('noSuchRecord') });
        return;
    }
    const db = new Database(CONFIGURATION_DB);
    db.executeQuery(query, [data.id])
      .then(() => {
        getConfigurations().then(() => {
          openNewTab(data, Number(data.id), type, t);
        });
      })
      .catch((error) => {
        setBlockUI({ value: true, msg: error.message });
      });
  };


  const onDeleteHandler = (projectName: string, projectId: string) => (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete({ name: projectName, id: projectId });
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    const db = new Database(CONFIGURATION_DB);
    let dbDeleteSuccessful = false;

    try {
      const project = projects[projectToDelete.name];
      const db_location_array = project.workspacePath?.split("\\").slice(0, -1);
      const deletePayload = {
        db_location: db_location_array.join("//"),
        db_name: project.inputFileName,
        operation: "delete_db"
      };
      // Backend Deletion
      const response = await mainWorker.axios(`${API.backendURL}/api/${API.analysis}`, deletePayload);

      if (response.status !== 200) {
        throw new Error(`Backend deletion failed with status ${response.status}: ${response.statusText || 'Unknown error'}`);
      }

      const responseData = response.data || response;
      if (responseData.error) {
        throw new Error(`Backend deletion failed: ${responseData.error}`);
      }

      if (responseData.status && responseData.status !== 'success') {
        throw new Error(`Backend deletion failed: ${responseData.msg || 'Unknown error'}`);
      }

      console.log('Backend deletion successful:', responseData.msg || 'Project deleted from backend');

      // Frontend Deletion
      await db.executeQuery(deleteProject, [projectToDelete.id]);
      dbDeleteSuccessful = true;

      // Update store and UI only if both operations succeeded
      deleteProjectFromStore(projectToDelete.name);
      setBlockUI({ value: true, msg: t('projectDeletedSuccess') });
      deleteModal.closeModal();
      setProjectToDelete(null);
    } catch (error: any) {
      if (dbDeleteSuccessful) {
        console.error('Database deletion succeeded but subsequent operation failed. Manual cleanup may be required.');
      }

      setBlockUI({ value: true, msg: error.message });
      deleteModal.closeModal();
      setProjectToDelete(null);
    }
  };

  const cancelDelete = () => {
    deleteModal.closeModal();
    setProjectToDelete(null);
  };

  const handleTreeItemExpand = useCallback((projectName: string) => {
    setTimeout(() => {
      if (treeContainerRef.current) {
        const treeItem = treeContainerRef.current.querySelector(`[data-project="${projectName}"]`);
        if (treeItem) {
          treeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 100);
  }, []);
  return (
    <div className={classes.explorerLayout}>
      <div className={classes.workspace}>
        <Text> {t('workspace', { ns: 'workspace' })}</Text>
      </div>

      {Object.keys(projects).length > 0 ? (
        <div ref={treeContainerRef} className="tree-comp">
          <Tree size="small" aria-label={'explorer-workspace'}>
            {Object.keys(projects).map((projectName) => {
              const project = projects?.[projectName];
              return (
                <TreeItem
                  key={projectName}
                  itemType="branch"
                  data-project={projectName}
                  onOpenChange={(_, data) => {
                    if (data.open) {
                      handleTreeItemExpand(projectName);
                    }
                  }}
                >
                  <TreeItemLayout
                    className={
                      project?.isOpenedData === 1 || project?.isOpenedOutput === 1 ? 'selected' : ''
                    }
                  >
                    <div className={classes.treeItemLayout}>
                      <div className={classes.kabobMenu}>
                        <div className={classes.treeItem}>
                          <div className="project-name">{projectName}</div>
                          {/**/}
                          <div className="date-file">
                            <Caption2 align="end">
                              {t('modified', { ns: 'workspace' })}:
                              {dateFormat(project?.modifiedDateTime)}
                              &nbsp; | &nbsp; {t('size', { ns: 'workspace' })}:
                              {mb(Number(project?.fileSize))}
                            </Caption2>
                          </div>
                        </div>
                        <div className={classes.kabobItem}>
                          <MdDeleteOutline onClick={onDeleteHandler(projectName, project.id)} />
                        </div>
                      </div>
                    </div>
                  </TreeItemLayout>
                  <Tree className={classes.leafLayout} aria-label={`leaf-${projectName}`}>
                    <TreeItem
                      itemType="leaf"
                      className={`leaf ${project?.isOpenedData === 1 && 'selected'}`}
                      onClick={onSelectedUpdate({ ...project, projectName }, DATA)}
                    >
                      <TreeItemLayout>
                        <Caption1>
                          <AiFillFileExcel /> {project?.inputFileName}
                        </Caption1>
                      </TreeItemLayout>
                    </TreeItem>
                    <TreeItem
                      itemType="leaf"
                      className={`leaf ${project?.isOpenedOutput === 1 && 'selected'}`}
                      onClick={onSelectedUpdate({ ...project, projectName }, OUTPUT)}
                    >
                      <TreeItemLayout>
                        <Caption1>
                          <AiFillControl /> {t('output', { ns: 'workspace' })}
                        </Caption1>
                      </TreeItemLayout>
                    </TreeItem>
                  </Tree>
                </TreeItem>
              );
            })}
          </Tree>
        </div>
      ) : (
        <RecordNotFound />
      )}

      <Modal
        {...deleteModal}
        title={t('deleteConfirmation')}
        okLabel={t("ok")}
        cancelLabel={t("cancel")}
        showCancel={true}
        showOk={true}
        size="small"
        ok={{ onClick: confirmDelete }}
        cancel={{ onClick: cancelDelete }}
      >
        <p> {t('confirmDelete', { projectName: projectToDelete?.name })}</p>
      </Modal>
    </div>
  );
};
export const Explorer = memo(ExplorerComp);
