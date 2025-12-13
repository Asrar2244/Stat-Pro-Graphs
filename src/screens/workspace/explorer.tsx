import { FC, memo, useRef, useCallback, useState, useEffect } from 'react';
import {
  Tree,
  TreeItem,
  TreeItemLayout,
  Caption2,
  Caption1,
  Text,
  Popover,
  PopoverTrigger,
  PopoverSurface,
} from '@fluentui/react-components';
import { useShallow } from 'zustand/react/shallow';
import { AiFillFileExcel, AiFillControl } from 'react-icons/ai';
import { MdBarChart } from 'react-icons/md';
import { CONFIGURATION_DB, DATA, OUTPUT, GRAPHS, API } from '@constants';
import { useTranslation } from 'react-i18next';
import { updateOutputFromProject, updateDataFromProject, updateGraphsFromProject, deleteProject } from '@backend';
import { Modal, RecordNotFound } from '@libs';
import { useGetInitialConfig, useFileSize, useFormatter, useNodeActions, useModal } from '@hooks';
import { useStartProStore, IProjectDetails } from '@store';
import { useExplorerLayout } from './styles-hook/use-explorer-style';
import { Database } from '@utils';
import { mainWorker } from '@workers/worker';
import { MdDeleteOutline } from 'react-icons/md';
import { getProjectSize, getProjectSizeBreakdown, ProjectSizeBreakdown } from '@utils/fs-apis';

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
  
  // State to store calculated directory sizes for each project
  const [projectSizes, setProjectSizes] = useState<Record<string, number>>({});
  const [loadingSizes, setLoadingSizes] = useState<Record<string, boolean>>({});
  const [projectBreakdowns, setProjectBreakdowns] = useState<Record<string, ProjectSizeBreakdown>>({});

  // Calculate directory sizes for all projects
  useEffect(() => {
    const calculateProjectSizes = async () => {
      for (const projectName in projects) {
        const project = projects[projectName];
        
        // Skip if already calculated or currently loading
        if (projectSizes[projectName] !== undefined || loadingSizes[projectName]) {
          continue;
        }
        
        // Get the total size of all project-related files
        if (project.workspacePath) {
          try {
            // Mark as loading
            setLoadingSizes(prev => ({ ...prev, [projectName]: true }));
            
            console.log(`📁 Calculating size for project "${projectName}":`, {
              workspacePath: project.workspacePath
            });
            
            // Calculate the total size and breakdown of all project files
            const breakdown = await getProjectSizeBreakdown(project.workspacePath);
            
            // Store the calculated size and breakdown
            setProjectSizes(prev => ({ ...prev, [projectName]: breakdown.total }));
            setProjectBreakdowns(prev => ({ ...prev, [projectName]: breakdown }));
            
            // Mark as not loading
            setLoadingSizes(prev => ({ ...prev, [projectName]: false }));
            
            console.log(`📊 Calculated size for project "${projectName}":`, breakdown);
          } catch (error) {
            console.error(`❌ Failed to calculate size for project "${projectName}":`, error);
            // Fallback to stored file size
            setProjectSizes(prev => ({ ...prev, [projectName]: Number(project.fileSize) || 0 }));
            setLoadingSizes(prev => ({ ...prev, [projectName]: false }));
          }
        }
      }
    };
    
    calculateProjectSizes();
  }, [projects]); // Re-run when projects change
  
  // Auto-refresh: Listen for project updates (data/output/graphs changes)
  useEffect(() => {
    const handleProjectUpdate = (event: CustomEvent) => {
      const { projectName: eventProjectName, workspacePath } = event.detail;
      
      console.log(`🔔 Received project update event:`, {
        eventProjectName,
        workspacePath,
        availableProjects: Object.keys(projects)
      });
      
      // Find the matching project - try exact match first
      let matchedProjectName = eventProjectName;
      let project = projects[eventProjectName];
      
      // If no exact match, try finding by workspace path
      if (!project && workspacePath) {
        for (const projName in projects) {
          if (projects[projName].workspacePath === workspacePath) {
            matchedProjectName = projName;
            project = projects[projName];
            console.log(`✅ Matched project by workspacePath: "${projName}"`);
            break;
          }
        }
      }
      
      // If still no match, try case-insensitive search
      if (!project) {
        const eventNameLower = eventProjectName?.toLowerCase();
        for (const projName in projects) {
          if (projName.toLowerCase() === eventNameLower) {
            matchedProjectName = projName;
            project = projects[projName];
            console.log(`✅ Matched project by case-insensitive name: "${projName}"`);
            break;
          }
        }
      }
      
      if (project?.workspacePath) {
        console.log(`🔄 Project "${matchedProjectName}" updated, recalculating size...`);
        
        // Recalculate size for this project
        (async () => {
          try {
            setLoadingSizes(prev => ({ ...prev, [matchedProjectName]: true }));
            const breakdown = await getProjectSizeBreakdown(project.workspacePath);
            setProjectSizes(prev => ({ ...prev, [matchedProjectName]: breakdown.total }));
            setProjectBreakdowns(prev => ({ ...prev, [matchedProjectName]: breakdown }));
            setLoadingSizes(prev => ({ ...prev, [matchedProjectName]: false }));
            console.log(`✅ Size updated for "${matchedProjectName}":`, breakdown);
          } catch (error) {
            console.error(`❌ Failed to update size for "${matchedProjectName}":`, error);
            setLoadingSizes(prev => ({ ...prev, [matchedProjectName]: false }));
          }
        })();
      } else {
        console.warn(`⚠️ Could not find project for update:`, {
          eventProjectName,
          workspacePath,
          availableProjects: Object.keys(projects)
        });
      }
    };
    
    // @ts-ignore - Custom event
    window.addEventListener('statpro:projectUpdated', handleProjectUpdate);
    
    console.log(`👂 Listening for project updates. Available projects:`, Object.keys(projects));
    
    return () => {
      // @ts-ignore
      window.removeEventListener('statpro:projectUpdated', handleProjectUpdate);
    };
  }, [projects]);

  const getRowCountForCategory = (breakdown: ProjectSizeBreakdown, category: 'data' | 'output' | 'graphs' | 'other'): number => {
    if (!breakdown.tableDetails) return 0;
    
    return breakdown.tableDetails
      .filter(table => {
        const tableLower = table.name.toLowerCase();
        if (category === 'data') {
          return tableLower.includes('data') || tableLower === 'input' || tableLower === 'excel';
        } else if (category === 'output') {
          return tableLower.includes('output') || tableLower === 'output';
        } else if (category === 'graphs') {
          return tableLower.includes('graph') || tableLower === 'graphs';
        } else {
          // Other: everything else
          return !(tableLower.includes('data') || tableLower === 'input' || tableLower === 'excel' ||
                   tableLower.includes('output') || tableLower.includes('graph'));
        }
      })
      .reduce((sum, table) => sum + table.rows, 0);
  };

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
      
      // Clear the calculated size and breakdown for the deleted project
      setProjectSizes(prev => {
        const updated = { ...prev };
        delete updated[projectToDelete.name];
        return updated;
      });
      setLoadingSizes(prev => {
        const updated = { ...prev };
        delete updated[projectToDelete.name];
        return updated;
      });
      setProjectBreakdowns(prev => {
        const updated = { ...prev };
        delete updated[projectToDelete.name];
        return updated;
      });
      
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
                      project?.isOpenedData === 1 || project?.isOpenedOutput === 1 || project?.isOpenedGraphs === 1 ? 'selected' : ''
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
                              {loadingSizes[projectName] 
                                ? 'calculating...' 
                                : projectBreakdowns[projectName] ? (
                                  <Popover openOnHover mouseLeaveDelay={0}>
                                    <PopoverTrigger disableButtonEnhancement>
                                      <span style={{ 
                                        cursor: 'help',
                                        borderBottom: '1px dotted rgba(255,255,255,0.5)'
                                      }}>
                                        {mb(projectSizes[projectName] !== undefined 
                                          ? projectSizes[projectName] 
                                          : Number(project?.fileSize))}
                                      </span>
                                    </PopoverTrigger>
                                    <PopoverSurface style={{
                                      padding: '12px 16px',
                                      backgroundColor: '#2b2b2b',
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                      minWidth: '200px'
                                    }}>
                                      <div style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        fontSize: '13px',
                                        color: 'rgba(255,255,255,0.9)'
                                      }}>
                                        <div style={{ 
                                          fontWeight: 'bold',
                                          marginBottom: '4px',
                                          paddingBottom: '8px',
                                          borderBottom: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                          Size Breakdown
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span>📊 Data:</span>
                                          <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold' }}>{mb(projectBreakdowns[projectName].breakdown.data)}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                              {getRowCountForCategory(projectBreakdowns[projectName], 'data').toLocaleString()} rows
                                            </div>
                                          </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span>📈 Output:</span>
                                          <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold' }}>{mb(projectBreakdowns[projectName].breakdown.output)}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                              {getRowCountForCategory(projectBreakdowns[projectName], 'output').toLocaleString()} rows
                                            </div>
                                          </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span>📉 Graphs:</span>
                                          <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold' }}>{mb(projectBreakdowns[projectName].breakdown.graphs)}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                              {getRowCountForCategory(projectBreakdowns[projectName], 'graphs').toLocaleString()} graphs
                                            </div>
                                          </div>
                                        </div>
                                        {projectBreakdowns[projectName].breakdown.other > 0 && (
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>📝 Other:</span>
                                            <div style={{ textAlign: 'right' }}>
                                              <div style={{ fontWeight: 'bold' }}>{mb(projectBreakdowns[projectName].breakdown.other)}</div>
                                              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                                {getRowCountForCategory(projectBreakdowns[projectName], 'other').toLocaleString()} rows
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <div style={{ 
                                          marginTop: '8px',
                                          paddingTop: '8px',
                                          borderTop: '1px solid rgba(255,255,255,0.1)',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          fontWeight: 'bold'
                                        }}>
                                          <span>Total:</span>
                                          <span>{mb(projectBreakdowns[projectName].total)}</span>
                                        </div>
                                      </div>
                                    </PopoverSurface>
                                  </Popover>
                                ) : (
                                  <span>
                                    {mb(projectSizes[projectName] !== undefined 
                                      ? projectSizes[projectName] 
                                      : Number(project?.fileSize))}
                                  </span>
                                )}
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
