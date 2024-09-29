import { FC, useEffect, useState } from 'react';
import {
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Field,
  Input,
  Button,
  Subtitle2Stronger,
  Caption2,
  Divider,
} from '@fluentui/react-components';
import { useToolsStyles } from './styles-hook/use-tools-style';
import { IGraph } from '@utils';
import { useTranslation } from 'react-i18next';
import { downloadImage } from 'plotly.js-dist';
interface IDownloadTools {
  plotly: any;
  graph: IGraph;
}
export const DownloadGraph: FC<IDownloadTools> = ({ graph, plotly }) => {
  const classes = useToolsStyles();
  const { t } = useTranslation('common');

  //onClick={onClickDownload(menu.format)}
  return (
    <ul className={classes.downloadMenu}>
      {graph.download?.map(
        (menu): React.ReactElement => (
          <li key={menu.format}>
            <Popover>
              <PopoverTrigger disableButtonEnhancement>
                <div className={classes.downloadItem}>
                  <div>{menu.format}</div>
                  {menu.description && (
                    <small className={classes.description}>{t(menu.description)}</small>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverSurface>
                <DownloadConfig
                  graph={graph}
                  plotly={plotly}
                  format={menu.format}
                  description={menu.description as string}
                />
              </PopoverSurface>
            </Popover>
          </li>
        ),
      )}
    </ul>
  );
};

const DownloadConfig: FC<IDownloadTools & { format: string; description: string }> = ({
  graph,
  plotly,
  format,
  description,
}) => {
  const [filename, setFilename] = useState<string>(graph.title ?? 'graph');
  const [width, setWidth] = useState<string | undefined>(plotly.current.clientWidth);
  const [height, setHeight] = useState<string | undefined>(plotly.current.clientHeight);
  const classes = useToolsStyles();
  const { t } = useTranslation('common');
  useEffect(() => {
    setWidth(plotly.current.clientWidth);
    setHeight(plotly.current.clientHeight);
  }, [plotly.current]);
  const onClickDownload = (format: string) => (): void => {
    downloadImage(plotly.current, { format, filename, width, height });
  };
  const onChangeHandle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.type === 'number') {
      const value = Number(e.target.value);
      if (e.target.name === 'width') {
        setWidth(value.toString());
      } else {
        setHeight(value.toString());
      }
    } else {
      setFilename(e.target.value);
    }
  };
  return (
    <div className={classes.downloadConfig}>
      <div>
        <Subtitle2Stronger className={classes.downloadTitle}>{t(format)} </Subtitle2Stronger>(
        <Caption2>{t(description)}</Caption2>)
      </div>
      <Divider />
      {format !== 'svg' ? (
        <>
          <Field label={t('filename')}>
            <Input defaultValue={filename} onChange={onChangeHandle} />
          </Field>
          <div className={classes.downloadHeightWidth}>
            <Field label={t('width')}>
              <Input type="number" value={width} name="width" onChange={onChangeHandle} />
            </Field>
            <Field label={t('height')}>
              <Input type="number" value={height} name="height" onChange={onChangeHandle} />
            </Field>
          </div>
        </>
      ) : (
        <div className={classes.vectorQuality}>Vector Quality image</div>
      )}
      <Divider />
      <Button appearance="primary" onClick={onClickDownload(format)}>
        {t('download')}
      </Button>
    </div>
  );
};
