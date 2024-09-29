import { FC, memo } from 'react';
import {
  Button,
  Tooltip as FTooltip,
  mergeClasses,
  Menu,
  MenuTrigger,
  MenuPopover,
} from '@fluentui/react-components';

import { LuSettings2 } from 'react-icons/lu';
import { PiDownloadSimple } from 'react-icons/pi';
import { FullScreenHandle } from 'react-full-screen';

import { useModal } from '@hooks';
import { useTranslation } from 'react-i18next';
import { useToolsStyles } from './styles-hook/use-tools-style';
// import { AnnotationModal } from './annotations';
import { GraphPaging } from './graph-paging';
import { IGraph } from '@utils';
import { useTableFetch } from './use-fetch-hook';
import { useGraphInit } from './use-graph-init';

import { GraphOptions } from './graph-options';
import { DownloadGraph } from './graph-download';
import { ZoomGraph, ZoomReset, FullScreen } from './zooming';
interface IGraphTool {
  handle: FullScreenHandle;
  direction?: 'row' | 'column';
  plotly: any;
  graph: IGraph;
  dbFileName: string;
  dbTableName: string;
}
const GraphTool: FC<IGraphTool> = ({
  handle,
  direction,
  plotly,
  graph,
  dbFileName,
  dbTableName,
}) => {
  const classes = useToolsStyles();
  const { t } = useTranslation('common');
  const { totalRecords, loadPagingData, loading } = useTableFetch({
    dbName: dbFileName,
    tableName: dbTableName,
    graph,
    plotly,
  });

  useGraphInit(plotly, graph);

  const toolsClass = mergeClasses(
    classes.toolsLayout,
    direction ? classes[direction] : classes.row,
  );

  //For Graph options
  const modal = useModal({ initialOpen: false });

  const handleGraphOptions = (): void => {
    modal.toggleModal();
  };

  return (
    <>
      <GraphPaging totalRecords={totalRecords} loading={loading} loadPagingData={loadPagingData} />
      <ul className={toolsClass}>
        <li>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <FTooltip content={t('download')} relationship="label" withArrow>
                <Button size="small" icon={<PiDownloadSimple />} appearance="transparent" />
              </FTooltip>
            </MenuTrigger>
            <MenuPopover>
              <DownloadGraph graph={graph} plotly={plotly} />
            </MenuPopover>
          </Menu>
        </li>
        <li>
          <FTooltip content={t('graphOptions')} withArrow relationship="label">
            <Button
              size="small"
              icon={<LuSettings2 />}
              appearance="transparent"
              onClick={handleGraphOptions}
            />
          </FTooltip>
        </li>
        <li>
          <ZoomReset plotly={plotly} />
        </li>
        <li>
          <ZoomGraph plotly={plotly} zoomIn={true} />
        </li>
        <li>
          <ZoomGraph plotly={plotly} zoomIn={false} />
        </li>
        <li>
          <FullScreen handle={handle} plotly={plotly} />
        </li>
      </ul>
      {modal.open && <GraphOptions {...modal} plotly={plotly} />}
      {/* {plotly.points && <AnnotationModal plotly={plotly} />} */}
    </>
  );
};

export const GraphTools = memo(GraphTool);
