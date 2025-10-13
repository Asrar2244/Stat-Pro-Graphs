import { FC, ReactNode, memo } from 'react';
import { Action, Layout, Model, TabNode, Actions } from 'flexlayout-react';
import { IoTerminal, IoFolderSharp } from 'react-icons/io5';
import { AiFillFileExcel } from 'react-icons/ai';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useStartProStore } from '@store';
import { useLayout } from './styles-hook/use-layout-style';
import { Explorer } from '../workspace/explorer';
import { TableRender } from '../table-render';
import { OutputRender } from '../output-render';
import { GraphsRender } from '../graphs-render';
// import { GraphViewRender } from '../graph-view-render';
import { EmptyDataView } from '../empty-data-view';
import { DATA, OUTPUT, CONFIGURATION_DB, GRAPH, GRAPHS, EMPTY_GRAPH_VIEW } from '@constants';
import { updateDataProjectClose, updateOutputProjectClose, updateGraphsProjectClose } from '@backend';
import { Database } from '@utils/db';
import { WelcomePage } from '../welcome';
import 'flexlayout-react/style/light.css';
import { useState } from 'react';
import { Dialog, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogActions, Checkbox, Button } from '@fluentui/react-components';

const AppBody: FC = () => {
  const { t } = useTranslation('dockLayout');
  const { model, setBlockUI } = useStartProStore(
    useShallow((state) => ({ model: state.model, setBlockUI: state.setBlockUI })),
  );
  const classes = useLayout();
  const factory = (node: TabNode): ReactNode => {
    switch (node.getComponent()) {
      case 'workspace':
        return <Explorer />;
      case `${DATA}-render`:
        return (
          <div className={classes.suppressOverFlow}>
            <TableRender {...node.getConfig()} />
          </div>
        );
      case `${OUTPUT}-render`:
        return (
          <div className={classes.suppressOverFlow}>
            <OutputRender {...node.getConfig()} />
          </div>
        );
      case `${GRAPHS}-render`:
        return (
          <div className={classes.suppressOverFlow}>
            <GraphsRender {...node.getConfig()} />
          </div>
        );
      case `${GRAPH}-render`:
        return (
          <div className={classes.suppressOverFlow}>
            {/* <GraphViewRender {...node.getConfig()} /> */}
            <div>Graph View Render temporarily disabled</div>
          </div>
        );
      case `${EMPTY_GRAPH_VIEW}-render`:
        return (
          <div className={classes.suppressOverFlow}>
            <EmptyDataView {...node.getConfig()} />
          </div>
        );
      case 'welcome':
        return (
          <div className={classes.suppressOverFlow}>
            <WelcomePage />
          </div>
        );
      default:
        return <></>;
    }
  };
  const iconFactory = (node: TabNode): ReactNode => {
    switch (node.getComponent()) {
      case 'terminal':
        return <IoTerminal />;
      case 'workspace':
        return <IoFolderSharp />;
      case 'file':
        return <AiFillFileExcel />;
      default:
        return <></>;
    }
  };
  const titleFactory = (node: TabNode): ReactNode => {
    const config = node.getConfig();
    const component = node.getComponent() ?? 'file';
    return (
      <div className={`${classes.titleLayout} ${config && classes.titleOptions}`}>
        <div>
          <span>{config?.type ?? t(component, { ns: 'dockLayout' })}</span>
        </div>
        <div className={classes.subTitle}>
          <span>{config?.name}</span> {config?.tabName && '['}
          <span title={config?.tabName}>{config?.tabName}</span> {config?.tabName && ']'}
        </div>
      </div>
    );
  };

  // Intercept close for GRAPHS tabs
  const [pendingClose, setPendingClose] = useState<{ tabId: string | null; runId: number | null }>({ tabId: null, runId: null });
  const [saveGroups, setSaveGroups] = useState({ title: true, axis: true, legend: true, appearance: true, series: true });

  const onAction = (action: Action): Action | undefined => {
    if (action.type === 'FlexLayout_DeleteTab') {
      const tabId = `${action.data.node}`;
      if (!tabId.includes('#')) {
        const [type, id] = tabId.split('-');
        if (type === GRAPHS) {
          const changedMap: Record<string, string> = ((window as any).statproChangedRuns || {}) as any;
          const hasChanges = !!changedMap[Number(id) as any];
          if (hasChanges) {
            setPendingClose({ tabId, runId: Number(id) });
            return undefined; // cancel close; show dialog
          }
          // no changes detected for this graph; allow close to proceed
        }
      }
    }
    return action;
  };

  const onModuleChange = (_model: Model, action: Action): void => {
    if (action.type === 'FlexLayout_DeleteTab') {
      const tabId = `${action.data.node}`;
      const hasHash = tabId.includes('#');
      if (!hasHash) {
        const slitted = tabId.split('-');
        const type = slitted[0];
        const id = slitted[1];
        let query = '';
        switch (type) {
          case DATA:
            query = updateDataProjectClose;
            break;
          case OUTPUT:
            query = updateOutputProjectClose;
            break;
          case GRAPHS:
            query = updateGraphsProjectClose;
            break;
          case EMPTY_GRAPH_VIEW:
            query = '';
            break;
          default:
            setBlockUI({ value: true, msg: t('noSuchRecord', { ns: 'errors' }) });
            return;
        }

        if (query === '') return;
        const db = new Database(CONFIGURATION_DB);
        db.executeQuery(query, [id]).catch((error) => {
          setBlockUI({ value: true, msg: error.message });
        });
      }
    }
  };

  return (
    <div className={classes.root}>
      <Layout
        model={model}
        titleFactory={titleFactory}
        factory={factory}
        iconFactory={iconFactory}
        onAction={onAction}
        onModelChange={onModuleChange}
      />
      {pendingClose.tabId && (
        <Dialog open modalType="modal">
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Save changes?</DialogTitle>
              <DialogContent>
                <div style={{ display: 'grid', gap: 8 }}>
                  {/* List graphs with pending changes (best-effort from window cache) */}
                  <div style={{ fontWeight: 600 }}>Graphs with changes:</div>
                  <div style={{ paddingLeft: 12 }}>
                    {Object.values((window as any).statproChangedRuns || {}).length > 0 ? (
                      <ul style={{ margin: 0 }}>
                        {Object.entries((window as any).statproChangedRuns || {}).map(([rid, name]: any) => (
                          <li key={rid}>{name}</li>
                        ))}
                      </ul>
                    ) : (
                      <div>No unsaved property changes detected.</div>
                    )}
                  </div>
                  <Checkbox label="Title" checked={saveGroups.title} onChange={(_, v) => setSaveGroups({ ...saveGroups, title: !!v.checked })} />
                  <Checkbox label="Axis labels" checked={saveGroups.axis} onChange={(_, v) => setSaveGroups({ ...saveGroups, axis: !!v.checked })} />
                  <Checkbox label="Legend" checked={saveGroups.legend} onChange={(_, v) => setSaveGroups({ ...saveGroups, legend: !!v.checked })} />
                  <Checkbox label="Appearance (grid, margins, padding, colors)" checked={saveGroups.appearance} onChange={(_, v) => setSaveGroups({ ...saveGroups, appearance: !!v.checked })} />
                  <Checkbox label="Series color" checked={saveGroups.series} onChange={(_, v) => setSaveGroups({ ...saveGroups, series: !!v.checked })} />
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => {
                  // Discard: clear change marker for this run
                  try {
                    const cmap: any = (window as any).statproChangedRuns || {};
                    if (pendingClose.runId) delete cmap[pendingClose.runId];
                    (window as any).statproChangedRuns = cmap;
                  } catch {}
                  if (pendingClose.tabId) model.doAction(Actions.deleteTab(pendingClose.tabId));
                  setPendingClose({ tabId: null, runId: null });
                }}>Discard</Button>
                <Button appearance="primary" onClick={() => {
                  if (pendingClose.runId) {
                    const event = new CustomEvent('statpro:saveGraphProperties', { detail: { runId: pendingClose.runId, groups: saveGroups } });
                    window.dispatchEvent(event);
                  }
                  // After save, clear change marker
                  try {
                    const cmap: any = (window as any).statproChangedRuns || {};
                    if (pendingClose.runId) delete cmap[pendingClose.runId];
                    (window as any).statproChangedRuns = cmap;
                  } catch {}
                  if (pendingClose.tabId) model.doAction(Actions.deleteTab(pendingClose.tabId));
                  setPendingClose({ tabId: null, runId: null });
                }}>Save selected</Button>
                <Button onClick={() => setPendingClose({ tabId: null, runId: null })}>Cancel</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
    </div>
  );
};

export const AppBodyArea = memo(AppBody);
