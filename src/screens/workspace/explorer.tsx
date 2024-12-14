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
import { Actions, DockLocation } from 'flexlayout-react';
import { CONFIGURATION_DB, DATA, OUTPUT } from '@constants';
import { useTranslation } from 'react-i18next';
import { updateOutputFromProject, updateDataFromProject } from '@backend';
import { RecordNotFound } from '@libs';
import { useGetInitialConfig, useFileSize, useFormatter, useToaster } from '@hooks';
import { useStartProStore, IProjectDetails } from '@store';
import { useExplorerLayout } from './styles-hook/use-explorer-style';
import { Database } from '@utils';

interface ISelector extends IProjectDetails {
  projectName: string;
}
const ExplorerComp: FC = () => {
  const classes = useExplorerLayout();
  const { mb } = useFileSize();
  const { dateFormat } = useFormatter();
  const toast = useToaster();
  const { getConfigurations } = useGetInitialConfig();
  const { projects, model } = useStartProStore(
    useShallow((state) => ({ projects: state.projects, model: state.model })),
  );
  const { t } = useTranslation('workspace');
  const onSelectedUpdate = (data: ISelector, type: string) => (): void => {
    const id = `${type}-${data.id}`;
    const tabChildren = model.getNodeById('layout-tabs')?.getChildren();
    const record = tabChildren?.find((f) => f.getId() === id);
    if (record) {
      model.doAction(Actions.selectTab(record.getId()));
      return;
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
        toast.error({ body: t('noSuchRecord') });
        return;
    }
    const db = new Database(CONFIGURATION_DB);
    db.executeQuery(query, [data.id])
      .then(() => {
        getConfigurations().then(() => {
          const index: number = model.getNodeById('layout-tabs')?.getChildren().length ?? 1;
          model.doAction(
            Actions.addNode(
              {
                type: 'tab',
                enableClose: true,
                name: data.projectName,
                id,
                component: `${type}-render`,
                config: {
                  tabName: data.workspacePath,
                  name: data.projectName,
                  type: t(type.toLowerCase(), { ns: 'workspace' }),
                  bareType: type,
                  id: data.id,
                  lastModified: data.modifiedDateTime,
                  isActive: data.isActive,
                  workspacePath: data.workspacePath,
                },
              },
              'layout-tabs',
              DockLocation.CENTER,
              index,
              true,
            ),
          );
        });
      })
      .catch((error) => {
        toast.error({ body: error.message });
      });
  };
  return (
    <div className={classes.explorerLayout}>
      <div className={classes.workspace}>
        <Text> {t('workspace', { ns: 'workspace' })}</Text>
      </div>

      {Object.keys(projects).length > 0 ? (
        <Tree size="small" aria-label={'explorer-workspace'} className="tree-comp">
          {Object.keys(projects).map((projectName) => {
            const project = projects[projectName];
            return (
              <TreeItem key={projectName} itemType="branch">
                <TreeItemLayout
                  className={
                    project.isOpenedData === 1 || project.isOpenedOutput === 1 ? 'selected' : ''
                  }
                >
                  <div className={classes.treeItemLayout}>
                    <div className="project-name">{projectName}</div>
                    <div className="date-file">
                      <Caption2 align="end">
                        {t('modified', { ns: 'workspace' })}:{dateFormat(project.modifiedDateTime)}
                        &nbsp; | &nbsp; {t('size', { ns: 'workspace' })}:
                        {mb(Number(project.fileSize))}
                      </Caption2>
                    </div>
                  </div>
                </TreeItemLayout>
                <Tree className={classes.leafLayout} aria-label={`leaf-${projectName}`}>
                  <TreeItem
                    itemType="leaf"
                    className={`leaf ${project.isOpenedData === 1 && 'selected'}`}
                    onClick={onSelectedUpdate({ ...project, projectName }, DATA)}
                  >
                    <TreeItemLayout>
                      <Caption1>
                        <AiFillFileExcel /> {t('data', { ns: 'workspace' })}
                      </Caption1>
                    </TreeItemLayout>
                  </TreeItem>
                  <TreeItem
                    itemType="leaf"
                    className={`leaf ${project.isOpenedOutput === 1 && 'selected'}`}
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
      ) : (
        <RecordNotFound />
      )}
    </div>
  );
};
export const Explorer = memo(ExplorerComp);
