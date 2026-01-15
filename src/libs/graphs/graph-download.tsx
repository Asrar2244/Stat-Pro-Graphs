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
import { useToaster } from '@hooks';
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
  const [width, setWidth] = useState<string | undefined>('800');
  const [height, setHeight] = useState<string | undefined>('600');
  const classes = useToolsStyles();
  const { t } = useTranslation('common');
  const toaster = useToaster();

  // Update width and height when plotly element is available
  useEffect(() => {
    const updateDimensions = () => {
      // plotly is GraphCanvasRef: { current: HTMLDivElement, plotly: plotlyInstance }
      // The actual Plotly graph element is in plotly.plotly.graph.current
      const plotlyGraphElement = plotly?.plotly?.graph?.current || plotly?.current;
      if (plotlyGraphElement) {
        setWidth(plotlyGraphElement.clientWidth?.toString() || '800');
        setHeight(plotlyGraphElement.clientHeight?.toString() || '600');
      }
    };

    updateDimensions();

    // Also update on window resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [plotly]);

  const onClickDownload = (format: string) => async (): Promise<void> => {
    // Get the actual Plotly graph DOM element
    let plotlyGraphElement: HTMLElement | null = null;

    // Try multiple ways to get the Plotly graph element
    if (plotly?.plotly?.graph?.current) {
      plotlyGraphElement = plotly.plotly.graph.current;
    } else if (plotly?.plotly?.graph) {
      plotlyGraphElement = plotly.plotly.graph;
    } else if (plotly?.current) {
      const container = plotly.current;
      const plotlyDiv = container.querySelector('.js-plotly-plot, [class*="plotly"], [id*="plotly"]') as HTMLElement;
      plotlyGraphElement = plotlyDiv || container;
    }

    if (!plotlyGraphElement) {
      toaster.error({ body: 'Graph is not ready for download.' });
      return;
    }

    const currentWidth = plotlyGraphElement.clientWidth || parseInt(width || '800');
    const currentHeight = plotlyGraphElement.clientHeight || parseInt(height || '600');

    const downloadOptions: any = {
      format,
      width: width ? parseInt(width) : currentWidth,
      height: height ? parseInt(height) : currentHeight,
      scale: 1,
    };

    if (format === 'jpeg' || format === 'webp') {
      downloadOptions.quality = 0.95;
    }

    try {
      // 1. Ask user for save location
      const { save } = await import('@tauri-apps/plugin-dialog');
      const suggestedName = filename || 'graph';

      const filePath = await save({
        defaultPath: `${suggestedName}.${format}`,
        filters: [{
          name: 'Image',
          extensions: [format]
        }]
      });

      if (!filePath) {
        // User cancelled
        return;
      }

      // 2. Generate image data
      // @ts-ignore - Plotly types might be missing toImage on default export
      const { toImage } = await import('plotly.js-dist');
      const dataUrl = await toImage(plotlyGraphElement, downloadOptions);

      // 3. Convert data URL to binary
      // dataUrl is like "data:image/png;base64,iVBOR..."
      const base64Data = dataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 4. Write to file
      const { writeFile } = await import('@tauri-apps/plugin-fs');
      await writeFile(filePath, bytes);

      // 5. Success message
      toaster.success({
        body: t('graphDownloaded', { filename: filePath }) || `Saved to: ${filePath}`,
      }, {
        timeout: 5000,
        pauseOnHover: true,
      });

    } catch (error) {
      console.error('Error downloading graph:', error);
      toaster.error({
        body: t('graphDownloadError') || 'Failed to download graph. Please try again.',
      });
    }
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
          {format === 'png' && (
            <div style={{
              backgroundColor: '#e6f3ff',
              border: '1px solid #0078d4',
              borderRadius: '4px',
              padding: '8px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#0078d4'
            }}>
              ⭐ <strong>Recommended Format</strong> - Same as canvas with mouse zoom support
            </div>
          )}
          <Field label={t('filename')}>
            <Input value={filename} name="filename" onChange={onChangeHandle} />
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

