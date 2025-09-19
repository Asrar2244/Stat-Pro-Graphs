import { FC, memo } from 'react';
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
import { MdBarChart } from 'react-icons/md';
import { CONFIGURATION_DB, DATA, OUTPUT, GRAPHS } from '@constants';
import { useTranslation } from 'react-i18next';
import { updateOutputFromProject, updateDataFromProject, updateGraphsFromProject } from '@backend';
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
  const { projects, setBlockUI } = useStartProStore(
    useShallow((state) => ({
      projects: state.projects,
      model: state.model,
      setBlockUI: state.setBlockUI,
    })),
  );

  const { selectTab, openNewTab, getOpenRecords } = useNodeActions();
  const { t } = useTranslation('workspace');

  const scrollProjectIntoView = (projectName: string) => {
    const el = document.getElementById(`project-${projectName}`) as HTMLElement | null;
    if (!el) return;
    const container = el.closest('.tree-comp') as HTMLElement | null;
    if (!container) {
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    // Compute offsetTop relative to the scroll container
    let offset = 0;
    let node: HTMLElement | null = el;
    while (node && node !== container) {
      offset += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    container.scrollTo({ top: Math.max(0, offset - 8), behavior: 'smooth' });
  };

  const onSelectedUpdate = (data: ISelector, type: string) => (): void => {
    // Ensure the project scrolls to the top when opening/expanding its items
    if ((data as any).projectName) {
      scrollProjectIntoView((data as any).projectName as string);
    }
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
      case GRAPHS:
        query = updateGraphsFromProject;
        break;
      default:
        setBlockUI({ value: true, msg: t('noSuchRecord') });
        return;
    }
    // If no query needed (e.g., GRAPHS without schema), open the tab directly
    if (query === '') {
      getConfigurations().then(() => {
        openNewTab(data, Number(data.id), type, t);
      });
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
        // Open the tab even if the update failed (backward compatible)
        getConfigurations().then(() => {
          openNewTab(data, Number(data.id), type, t);
        });
        // Optionally inform user
        setBlockUI({ value: true, msg: error.message });
      });
  };
  const onDeleteHandler = (e: any) => {
    console.log('deleting the work space');
    e.preventDefault();
  };
  return (
    <div className={classes.explorerLayout}>
      <div className={classes.workspace}>
        <Text> {t('workspace', { ns: 'workspace' })}</Text>
      </div>

      {Object.keys(projects).length > 0 ? (
        <Tree size="small" aria-label={'explorer-workspace'} className="tree-comp">
          {Object.keys(projects).map((projectName) => {
            const project = projects?.[projectName];
            return (
              <TreeItem key={projectName} id={`project-${projectName}`} itemType="branch">
                <TreeItemLayout
                  className={
                    project?.isOpenedData === 1 || project?.isOpenedOutput === 1 || project?.isOpenedGraphs === 1
                      ? 'selected'
                      : ''
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
                  <TreeItem
                    itemType="leaf"
                    className={`leaf ${project?.isOpenedGraphs === 1 && 'selected'}`}
                    onClick={onSelectedUpdate({ ...project, projectName }, GRAPHS)}
                  >
                    <TreeItemLayout>
                      <Caption1>
                        <MdBarChart /> {t('graphs', { ns: 'workspace' })}
                      </Caption1>
                    </TreeItemLayout>
                  </TreeItem>
                </Tree>
              </TreeItem>
            );
          })}
        </Tree>
      ) : (
        <RecordNotFound />
      )}
    </div>
  );
};
export const Explorer = memo(ExplorerComp);
