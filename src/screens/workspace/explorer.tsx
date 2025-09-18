import { FC, memo, useRef, useCallback } from 'react';
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
import { CONFIGURATION_DB, DATA, OUTPUT } from '@constants';
import { useTranslation } from 'react-i18next';
import { updateOutputFromProject, updateDataFromProject } from '@backend';
import { RecordNotFound } from '@libs';
import { useGetInitialConfig, useFileSize, useFormatter, useNodeActions } from '@hooks';
import { useStartProStore, IProjectDetails } from '@store';
import { useExplorerLayout } from './styles-hook/use-explorer-style';
import { Database } from '@utils';
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
  const { projects, setBlockUI } = useStartProStore(
    useShallow((state) => ({
      projects: state.projects,
      model: state.model,
      setBlockUI: state.setBlockUI,
    })),
  );

  const { selectTab, openNewTab, getOpenRecords } = useNodeActions();
  const { t } = useTranslation('workspace');

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
  const onDeleteHandler = (e: any) => {
    console.log('deleting the work space');
    e.preventDefault();
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
                  onOpenChange={(event, data) => {
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
                          <MdDeleteOutline onClick={onDeleteHandler} />
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
    </div>
  );
};
export const Explorer = memo(ExplorerComp);
