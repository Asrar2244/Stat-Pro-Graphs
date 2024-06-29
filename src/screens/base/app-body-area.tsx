import { FC, ReactNode, memo } from 'react';
import { Action, Layout, Model, TabNode } from 'flexlayout-react';
import { IoTerminal, IoFolderSharp } from 'react-icons/io5';
import { AiFillFileExcel } from 'react-icons/ai';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useToaster } from '@hooks';
import { useStartProStore } from '@store';
import { useLayout } from './styles-hook/use-layout-style';
import { Explorer } from '../workspace/explorer';
import { TableRender } from '../table-render';
import { OutputRender } from '../output-render';
import { DATA, OUTPUT, CONFIGURATION_DB } from '@constants';
import { updateDataProjectClose, updateOutputProjectClose } from '@backend';
import { Database } from '@utils/db';
import { WelcomePage } from '../welcome';
import 'flexlayout-react/style/light.css';

const AppBody: FC = () => {
  const { t } = useTranslation('dockLayout');
  const { model } = useStartProStore(useShallow((state) => ({ model: state.model })));
  const toast = useToaster();
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
          <span>{config?.tabName}</span>
        </div>
      </div>
    );
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
          default:
            toast.error({
              body: t('noSuchRecord', { ns: 'errors' }),
            });
            return;
        }

        if (query === '') return;
        const db = new Database(CONFIGURATION_DB);
        db.executeQuery(query, [id]).catch((error) => {
          toast.error({ body: error.message });
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
        onModelChange={onModuleChange}
      />
    </div>
  );
};

export const AppBodyArea = memo(AppBody);
