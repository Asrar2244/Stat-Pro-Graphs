import { FC, lazy, memo } from 'react';
import {
  Button,
  Tooltip as FTooltip,
  mergeClasses,
  Menu,
  MenuTrigger,
  MenuPopover,
} from '@fluentui/react-components';
import { SlRefresh } from 'react-icons/sl';
import { CiZoomIn, CiZoomOut } from 'react-icons/ci';
import { RiFullscreenLine } from 'react-icons/ri';
import { LuSettings2 } from 'react-icons/lu';
import { PiDownloadSimple } from 'react-icons/pi';

import { FullScreenHandle } from 'react-full-screen';
import { SuspenseLoad } from '@libs';
import { IZoomGraph, useModal, IPlotlyGraphOutput } from '@hooks';
import { useTranslation } from 'react-i18next';
import { useToolsStyles } from './styles-hook/use-tools-style';
import { AnnotationModal } from './annotations';
const GraphOptions = lazy(() =>
  import('./graph-options').then((modules) => ({ default: modules.GraphOptions })),
);

interface IGraphTool {
  handle: FullScreenHandle;
  zoomed: IZoomGraph;
  direction?: 'row' | 'column';
  title?: string;
  plotly: IPlotlyGraphOutput;
}
const GraphTool: FC<IGraphTool> = ({ handle, zoomed, direction, title, plotly }) => {
  const classes = useToolsStyles();
  const { t } = useTranslation('common');
  const toolsClass = mergeClasses(
    classes.toolsLayout,
    direction ? classes[direction] : classes.row,
  );
  //For Graph options
  const modal = useModal({ initialOpen: false });
  const resetZoomHandler = (): void => {
    zoomed.zoomReset();
  };
  const zoomHandler = (value: number[]) => (): void => {
    zoomed.zoom(value);
  };
  const handelGraphOptions = (): void => {
    modal.toggleModal();
  };
  const fullScreenHandler = (): void => {
    if (handle.active) {
      handle.exit();
    } else {
      handle.enter();
    }
    zoomed.zoomReset();
  };
  const onClickDownload = (format: string) => (): void => {
    plotly.download(format, title);
  };
  return (
    <>
      <ul className={toolsClass}>
        <li>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <FTooltip content={t('download')} relationship="label" withArrow>
                <Button size="small" icon={<PiDownloadSimple />} appearance="transparent" />
              </FTooltip>
            </MenuTrigger>
            <MenuPopover>
              <ul className={classes.downloadMenu}>
                {plotly?.editedConfig?.download?.map(
                  (menu): React.ReactElement => (
                    <li key={menu.format} onClick={onClickDownload(menu.format)}>
                      <div>{menu.format}</div>
                      {menu.description && (
                        <small className={classes.description}>{t(menu.description)}</small>
                      )}
                    </li>
                  ),
                )}
              </ul>
            </MenuPopover>
          </Menu>
        </li>
        <li>
          <FTooltip content={t('graphOptions')} withArrow relationship="label">
            <Button
              size="small"
              icon={<LuSettings2 />}
              appearance="transparent"
              onClick={handelGraphOptions}
            />
          </FTooltip>
        </li>
        <li>
          <FTooltip content={t('resetZoom')} withArrow relationship="label">
            <Button
              size="small"
              icon={<SlRefresh />}
              appearance="transparent"
              onClick={resetZoomHandler}
            />
          </FTooltip>
        </li>
        <li>
          <FTooltip content="Zoom in" withArrow relationship="label">
            <Button
              size="small"
              icon={<CiZoomIn />}
              appearance="transparent"
              onClick={zoomHandler([2, 3])}
            />
          </FTooltip>
        </li>
        <li>
          <FTooltip content={t('zoomOut')} withArrow relationship="label">
            <Button
              size="small"
              icon={<CiZoomOut />}
              appearance="transparent"
              onClick={zoomHandler([1, 5])}
            />
          </FTooltip>
        </li>
        <li>
          <FTooltip content={t('fullScreen')} withArrow relationship="label">
            <Button
              size="small"
              icon={<RiFullscreenLine />}
              appearance="transparent"
              onClick={fullScreenHandler}
            />
          </FTooltip>
        </li>
      </ul>
      <SuspenseLoad>
        {modal.open && <GraphOptions {...modal} plotly={plotly} />}
        {plotly.points && <AnnotationModal plotly={plotly} />}
      </SuspenseLoad>
    </>
  );
};

export const GraphTools = memo(GraphTool);
