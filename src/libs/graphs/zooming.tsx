import { Button, Tooltip } from '@fluentui/react-components';
import { FC } from 'react';
import { CiZoomIn, CiZoomOut } from 'react-icons/ci';
import { useZoomGraph } from '@hooks';
import { useTranslation } from 'react-i18next';
import { SlRefresh } from 'react-icons/sl';
import { FullScreenHandle } from 'react-full-screen';
import { RiFullscreenLine } from 'react-icons/ri';

export const ZoomGraph: FC<{ plotly: any; zoomIn: boolean }> = ({ plotly, zoomIn: isZoomIn }) => {
  const { zoomIn, zoomOut } = useZoomGraph(plotly);
  const { t } = useTranslation('common');
  const zoomHandler = () => {
    if (isZoomIn) {
      zoomIn();
    } else {
      zoomOut();
    }
  };
  return (
    <Tooltip content={t(zoomIn ? 'zoomIn' : 'zoomOut')} withArrow relationship="label">
      <Button
        size="small"
        icon={zoomIn ? <CiZoomIn /> : <CiZoomOut />}
        appearance="transparent"
        onClick={zoomHandler}
      />
    </Tooltip>
  );
};

export const ZoomReset: FC<{ plotly: any }> = ({ plotly }) => {
  const { zoomReset } = useZoomGraph(plotly);
  const { t } = useTranslation('common');

  return (
    <Tooltip content={t('resetZoom')} withArrow relationship="label">
      <Button size="small" icon={<SlRefresh />} appearance="transparent" onClick={zoomReset} />
    </Tooltip>
  );
};

export const FullScreen: FC<{ plotly: any; handle: FullScreenHandle }> = ({ plotly, handle }) => {
  const { zoomReset } = useZoomGraph(plotly);
  const { t } = useTranslation('common');
  const fullScreenHandler = (): void => {
    if (handle.active) {
      plotly.current.style.width = '100%';
      plotly.current.style.height = '100%';
      handle.exit();
    } else {
      plotly.current.style.width = '100%';
      plotly.current.style.height = '96vh';
      handle.enter();
    }
    zoomReset();
  };
  return (
    <Tooltip content={t('fullScreen')} withArrow relationship="label">
      <Button
        size="small"
        icon={<RiFullscreenLine />}
        appearance="transparent"
        onClick={fullScreenHandler}
      />
    </Tooltip>
  );
};
