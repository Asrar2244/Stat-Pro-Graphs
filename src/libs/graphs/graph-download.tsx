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
  
  const onClickDownload = (format: string) => (): void => {
    // Get the actual Plotly graph DOM element
    // plotly is GraphCanvasRef: { current: HTMLDivElement, plotly: plotlyInstance }
    // The Plotly graph element is in plotly.plotly.graph.current
    let plotlyGraphElement: HTMLElement | null = null;
    
    // Try multiple ways to get the Plotly graph element
    if (plotly?.plotly?.graph?.current) {
      // Standard path: plotly instance has graph ref
      plotlyGraphElement = plotly.plotly.graph.current;
    } else if (plotly?.plotly?.graph) {
      // If graph is the element directly (not a ref)
      plotlyGraphElement = plotly.plotly.graph;
    } else if (plotly?.current) {
      // Fallback to container element
      // Look for the actual Plotly graph div inside the container
      const container = plotly.current;
      const plotlyDiv = container.querySelector('.js-plotly-plot, [class*="plotly"], [id*="plotly"]') as HTMLElement;
      plotlyGraphElement = plotlyDiv || container;
    }
    
    if (!plotlyGraphElement) {
      console.error('Plotly element not available for download', { 
        plotly, 
        hasPlotly: !!plotly?.plotly,
        hasGraph: !!plotly?.plotly?.graph,
        hasGraphCurrent: !!plotly?.plotly?.graph?.current,
        hasCurrent: !!plotly?.current
      });
      alert('Graph is not ready for download. Please wait for the graph to load.');
      return;
    }
    
    // Download with same dimensions as canvas
    const currentWidth = plotlyGraphElement.clientWidth || parseInt(width || '800');
    const currentHeight = plotlyGraphElement.clientHeight || parseInt(height || '600');
    
    const downloadOptions: any = {
      format,
      filename: filename || 'graph',
      width: width ? parseInt(width) : currentWidth,
      height: height ? parseInt(height) : currentHeight,
      scale: 1,
    };
    
    // Add format-specific options
    if (format === 'jpeg' || format === 'webp') {
      downloadOptions.quality = 0.95;
    }
    
    try {
      console.log('Downloading graph:', {
        format,
        filename: downloadOptions.filename,
        width: downloadOptions.width,
        height: downloadOptions.height,
        element: plotlyGraphElement,
        elementTag: plotlyGraphElement.tagName,
        elementClasses: plotlyGraphElement.className
      });
      
      // Trigger download
      downloadImage(plotlyGraphElement, downloadOptions);
      
      // Show success notification with filename
      const downloadedFileName = `${downloadOptions.filename}.${format}`;
      toaster.success({
        body: t('graphDownloaded', { filename: downloadedFileName }) || `Graph downloaded: ${downloadedFileName}`,
      }, {
        timeout: 5000,
        pauseOnHover: true,
      });
      
      console.log('Graph download initiated:', {
        filename: downloadedFileName,
        format,
        width: downloadOptions.width,
        height: downloadOptions.height
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

