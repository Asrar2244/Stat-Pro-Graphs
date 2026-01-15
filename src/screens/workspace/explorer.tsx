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
  Input,
} from '@fluentui/react-components';
import { useShallow } from 'zustand/react/shallow';
import { AiFillFileExcel, AiFillControl } from 'react-icons/ai';
import { MdBarChart } from 'react-icons/md';
import { CONFIGURATION_DB, DATA, OUTPUT, GRAPHS, API, EMPTY_GRAPH_VIEW } from '@constants';
import { useTranslation } from 'react-i18next';
import { updateOutputFromProject, updateDataFromProject, updateGraphsFromProject, deleteProject, updateProjectName } from '@backend';
import { Modal, RecordNotFound } from '@libs';
import { useGetInitialConfig, useFileSize, useFormatter, useNodeActions, useModal, useToaster } from '@hooks';
import { useStartProStore, IProjectDetails } from '@store';
import { useExplorerLayout } from './styles-hook/use-explorer-style';
import { useSizePopoverStyles } from './styles-hook/use-size-popover-styles';
import { Database } from '@utils';
import { mainWorker } from '@workers/worker';
import { MdDeleteOutline } from 'react-icons/md';
import { getProjectSize, getProjectSizeBreakdown, ProjectSizeBreakdown } from '@utils/fs-apis';

export interface ISelector extends IProjectDetails {
  projectName: string;
  isEmptyDataView?: boolean;
  dataState?: 'draft' | 'published';
}

const ExplorerComp: FC = () => {
  const classes = useExplorerLayout();
  const popoverClasses = useSizePopoverStyles();
  const { mb } = useFileSize();
  const { dateFormat } = useFormatter();
  const { getConfigurations } = useGetInitialConfig();
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const { projects, model, setBlockUI, deleteProject: deleteProjectFromStore } = useStartProStore(
    useShallow((state) => ({
      projects: state.projects,
      model: state.model,
      setBlockUI: state.setBlockUI,
      deleteProject: state.deleteProject,
    })),
  );

  useEffect(() => {
    // Projects in store are available for rendering
  }, [projects]);

  const { selectTab, openNewTab, getOpenRecords, closeTabsByProjectId } = useNodeActions();
  const { t } = useTranslation('workspace');
  const [projectToDelete, setProjectToDelete] = useState<{ name: string, id: string } | null>(null);
  const deleteModal = useModal({ initialOpen: false });
  const toaster = useToaster();

  // Renaming state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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

    // CRITICAL: Detect empty data view projects and use EMPTY_GRAPH_VIEW instead of DATA
    // Empty data view projects have names matching "empty data view X" pattern
    // We use regex with case insensitive check to be robust
    const isEmptyDataViewProject = (data.projectName && /^empty\s+data\s+view\s+\d+$/i.test(data.projectName.trim()));

    // If clicking on datasheet of an empty data view project, use EMPTY_GRAPH_VIEW instead of DATA
    const actualType = (type === DATA && isEmptyDataViewProject) ? EMPTY_GRAPH_VIEW : type;

    // For empty data views, also check by workspacePath since tab ID might differ before/after saving
    let record: any = undefined;
    if (isEmptyDataViewProject && data.workspacePath) {
      model.visitNodes((node) => {
        if (node.getType() === 'tab') {
          // First try to match by ID (standard way)
          if (node.getId() === `${actualType}-${data.id}`) {
            record = node;
            return;
          }

          // If not found, try to match by workspacePath (for tabs created before project was saved)
          const tabJson: any = node.toJson();
          if (tabJson?.config?.isEmptyDataView === true &&
            tabJson?.config?.workspacePath === data.workspacePath &&
            tabJson?.component === `${actualType}-render`) {
            record = node;
            return;
          }
        }
      });
    } else {
      const result = getOpenRecords(data, actualType);
      record = result.record;
    }

    if (record) {
      selectTab(record.getId());
      return; // Tab already exists, just select it and return
    }
    let query = '';
    switch (type) {
      case DATA:
        // For empty data view projects, don't update isOpenedData (they use EMPTY_GRAPH_VIEW)
        if (isEmptyDataViewProject) {
          // Skip database update for empty data view projects
          getConfigurations().then(() => {
            openNewTab({ ...data, isEmptyDataView: true, dataState: 'published' }, Number(data.id), EMPTY_GRAPH_VIEW, t);
          });
          return;
        }
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
        const config = {
          ...data,
          dataState: 'published' as const,
          isEmptyDataView: actualType === EMPTY_GRAPH_VIEW
        };
        openNewTab(config, Number(data.id), actualType, t);
      });
      return;
    }
    const db = new Database(CONFIGURATION_DB);
    db.executeQuery(query, [data.id])
      .then(() => {
        getConfigurations().then(() => {
          const config = {
            ...data,
            dataState: 'published' as const,
            isEmptyDataView: actualType === EMPTY_GRAPH_VIEW
          };
          openNewTab(config, Number(data.id), actualType, t);
        });
      })
      .catch((error) => {
        // Open the tab even if the update failed (backward compatible)
        getConfigurations().then(() => {
          const config = {
            ...data,
            dataState: 'published' as const,
            isEmptyDataView: actualType === EMPTY_GRAPH_VIEW
          };
          openNewTab(config, Number(data.id), actualType, t);
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

      // CRITICAL: Close tabs FIRST to release file locks
      // The hooks (useSpreadsheetData, etc.) enable db.close() on unmount/cleanup
      // We must close the tabs to trigger this cleanup before attempting file deletion
      closeTabsByProjectId(projectToDelete.id);

      // Wait a moment for React to unmount components and cleanup hooks to run
      await new Promise(resolve => setTimeout(resolve, 300));

      // Only delete physical file if it's NOT an external project
      if (project.isExternal !== 1) {
        const db_location_array = project.workspacePath?.split("\\").slice(0, -1);
        const deletePayload = {
          db_location: db_location_array.join("//"),
          db_name: project.inputFileName,
          operation: "delete_db"
        };

        // Retry logic for backend deletion to handle transient file locks
        let deleteResponse = null;
        let retries = 3;
        while (retries > 0) {
          try {
            // Backend Deletion
            const response = await mainWorker.axios(`${API.backendURL}/api/${API.analysis}`, deletePayload);

            // Check for success or specific error types
            if (response.status !== 200) {
              throw new Error(`Backend deletion failed with status ${response.status}: ${response.statusText || 'Unknown error'}`);
            }

            const responseData = response.data || response;

            // If error is file lock, throw to trigger retry
            if (responseData.error) {
              const errLower = responseData.error.toLowerCase();
              if (errLower.includes('winerror 32') || errLower.includes('used by another process')) {
                throw new Error(`File locked: ${responseData.error}`);
              }
              // Other errors - fail immediately
              throw new Error(`Backend deletion failed: ${responseData.error}`);
            }

            if (responseData.status && responseData.status !== 'success') {
              const msgLower = (responseData.msg || '').toLowerCase();
              if (msgLower.includes('winerror 32') || msgLower.includes('used by another process')) {
                throw new Error(`File locked: ${responseData.msg}`);
              }
              throw new Error(`Backend deletion failed: ${responseData.msg || 'Unknown error'}`);
            }

            // Success!
            deleteResponse = responseData;
            console.log('Backend deletion successful:', responseData.msg || 'Project deleted from backend');
            break;

          } catch (err: any) {
            const isLockError = err.message.toLowerCase().includes('winerror 32') ||
              err.message.toLowerCase().includes('used by another process') ||
              err.message.toLowerCase().includes('file locked');

            if (isLockError && retries > 1) {
              console.warn(`⚠️ File locked during deletion, retrying... (${retries - 1} left)`);
              await new Promise(r => setTimeout(r, 1000)); // Wait 1 second
              retries--;
            } else {
              throw err; // Rethrow last error if out of retries or not a lock error
            }
          }
        }
      } else {
        console.log('External project detected - skipping backend file deletion');
      }

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

      setBlockUI({ value: true, msg: project.isExternal === 1 ? 'Project removed from workspace' : t('projectDeletedSuccess') });
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

  const handleNameDoubleClick = (projectId: string, currentName: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProjectId(projectId);
    setEditValue(currentName);
  };

  const isRenamingRef = useRef(false);

  const handleRenameSubmit = async () => {
    if (!editingProjectId || isRenamingRef.current) return;
    isRenamingRef.current = true;

    try {
      // Basic Validation
      const trimmedName = editValue.trim();
      if (!trimmedName) return; // Will close in finally

      // Check if name hasn't changed
      const currentProject = Object.values(projects).find((p: any) => p.id === editingProjectId);
      if (currentProject && currentProject.projectName === trimmedName) return;

      // Check if name exists (case insensitive check against OTHER projects using keys)
      const nameExists = Object.keys(projects).some(key =>
        projects[key].id !== editingProjectId && key.toLowerCase() === trimmedName.toLowerCase()
      );

      if (nameExists) {
        toaster.error({ body: t('projectNameExists', { ns: 'errors' }) || `Project name "${trimmedName}" already exists.` });
        return;
      }

      // setBlockUI({ value: true, msg: 'Renaming project...' }); // Removed for slicker UI
      const db = new Database(CONFIGURATION_DB);
      await db.executeQuery(updateProjectName, [trimmedName, editingProjectId]);

      // Update store
      await getConfigurations();
      // setBlockUI({ value: false, msg: '' });
    } catch (error: any) {
      console.error('Rename failed:', error);
      toaster.error({ body: error.message || 'Failed to rename project' });
    } finally {
      setEditingProjectId(null);
      isRenamingRef.current = false;
    }
  };

  const onEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingProjectId(null);
    }
  };

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
                          {editingProjectId === project.id ? (
                            <Input
                              value={editValue}
                              onChange={(_, data) => setEditValue(data.value)}
                              onBlur={handleRenameSubmit}
                              onKeyDown={onEditKeyDown}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              size="small"
                              style={{ minWidth: 120 }}
                            />
                          ) : (
                            <div
                              className="project-name"
                              onDoubleClick={handleNameDoubleClick(project.id, projectName)}
                              title="Double click to rename"
                            >
                              {projectName}
                            </div>
                          )}
                          {/**/}
                          <div className="date-file">
                            <Caption2 align="end">
                              {t('modified', { ns: 'workspace' })}:
                              {dateFormat(project?.modifiedDateTime)}
                              &nbsp; | &nbsp; {t('size', { ns: 'workspace' })}:
                              {loadingSizes[projectName]
                                ? 'calculating...'
                                : projectBreakdowns[projectName] ? (
                                  <Popover
                                    openOnHover
                                    mouseLeaveDelay={0}
                                    positioning={{ position: 'after', align: 'top', offset: { crossAxis: 8, mainAxis: 4 } }}
                                  >
                                    <PopoverTrigger disableButtonEnhancement>
                                      <span className={popoverClasses.trigger}>
                                        {mb(projectSizes[projectName] !== undefined
                                          ? projectSizes[projectName]
                                          : Number(project?.fileSize))}
                                      </span>
                                    </PopoverTrigger>
                                    <PopoverSurface className={popoverClasses.popoverSurface}>
                                      <div className={popoverClasses.container}>
                                        <div className={popoverClasses.title}>
                                          Size Breakdown
                                        </div>
                                        <div className={popoverClasses.row}>
                                          <span className={popoverClasses.label}>📊 Data</span>
                                          <div className={popoverClasses.valueContainer}>
                                            <div className={popoverClasses.value}>{mb(projectBreakdowns[projectName].breakdown.data)}</div>
                                            <div className={popoverClasses.subValue}>
                                              {getRowCountForCategory(projectBreakdowns[projectName], 'data').toLocaleString()} rows
                                            </div>
                                          </div>
                                        </div>
                                        <div className={popoverClasses.row}>
                                          <span className={popoverClasses.label}>📈 Output</span>
                                          <div className={popoverClasses.valueContainer}>
                                            <div className={popoverClasses.value}>{mb(projectBreakdowns[projectName].breakdown.output)}</div>
                                            <div className={popoverClasses.subValue}>
                                              {getRowCountForCategory(projectBreakdowns[projectName], 'output').toLocaleString()} rows
                                            </div>
                                          </div>
                                        </div>
                                        <div className={popoverClasses.row}>
                                          <span className={popoverClasses.label}>📉 Graphs</span>
                                          <div className={popoverClasses.valueContainer}>
                                            <div className={popoverClasses.value}>{mb(projectBreakdowns[projectName].breakdown.graphs)}</div>
                                            <div className={popoverClasses.subValue}>
                                              {getRowCountForCategory(projectBreakdowns[projectName], 'graphs').toLocaleString()} graphs
                                            </div>
                                          </div>
                                        </div>
                                        {projectBreakdowns[projectName].breakdown.other > 0 && (
                                          <div className={popoverClasses.row}>
                                            <span className={popoverClasses.label}>📝 Other</span>
                                            <div className={popoverClasses.valueContainer}>
                                              <div className={popoverClasses.value}>{mb(projectBreakdowns[projectName].breakdown.other)}</div>
                                              <div className={popoverClasses.subValue}>
                                                {getRowCountForCategory(projectBreakdowns[projectName], 'other').toLocaleString()} rows
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <div className={popoverClasses.totalRow}>
                                          <span>Total</span>
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
                        <div className={classes.kabobItem} title={project.isExternal === 1 ? 'Remove from Workspace' : 'Delete Project'}>
                          <MdDeleteOutline
                            onClick={onDeleteHandler(projectName, project.id)}
                            style={project.isExternal === 1 ? { color: '#ffaa00' } : {}}
                          />
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
        <p>
          {projectToDelete && projects[projectToDelete.name]?.isExternal === 1
            ? `Are you sure you want to remove "${projectToDelete.name}" from your workspace? The original file will not be deleted.`
            : t('confirmDelete', { projectName: projectToDelete?.name })
          }
        </p>
      </Modal>
    </div>
  );
};
export const Explorer = memo(ExplorerComp);
