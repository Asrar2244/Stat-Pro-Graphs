//@ts-nocheck
import {
  Data,
  Layout,
  Config,
  newPlot,
  purge,
  react,
  relayout,
  downloadImage,
} from 'plotly.js-dist';
import { Annotations } from 'plotly.js';
import { useEffect, useMemo, useRef, useState } from 'react';
export interface IGOptions {
  default: {
    graph: string;
    mode: string;
  };
  graphs: string[];
  modes: string[];
  download: {
    format: string;
    description?: string;
  }[];
}
interface IGraphProps {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  title?: string;
  editedConfig?: IGOptions;
  enablePointEvent?: boolean;
}
export interface IPlotlyGraphOutput {
  graph: any;
  redraw: (props: IGraphProps) => void;
  screenResize: (width: string | number, height: string | number) => void;
  editedConfig?: IGOptions;
  download: (format: string, filename?: string, width?: number, height?: number) => void;
  setAnnotations: (annotations: Annotations) => void;
  points?: IPoints;
  resetPoints: () => void;
}
export interface IPoints {
  x: number;
  y: number;
  z?: number;
}
/**
 * Custom hook that provides a Plotly graph instance and various utility functions for interacting with the graph.
 *
 * @param {IGraphProps} props - The props object containing the necessary data, configuration, and layout for the graph.
 * @returns {IPlotlyGraphOutput} - An object containing the graph instance and utility functions.
 */
export const usePlotly = ({
  data,
  config,
  layout,
  editedConfig,
  enablePointEvent,
}: IGraphProps): IPlotlyGraphOutput => {
  const graph = useRef<any>();
  const [points, setPoints] = useState<IPoints | undefined>(undefined);
  const initial = useMemo(() => {
    return {
      layout: {
        showlegend: true,
        autosize: true,
        margin: {
          b: 20,
          l: 40,
          r: 20,
          t: 20,
        },
        legend: {
          orientation: 'h',
          itemwidth: 20,
        },
        ...layout,
      },

      config: {
        displayModeBar: false,
        responsive: true,
        editable: false,
        ...config,
      },
      annotation: {
        clicktoshow: 'onoff',
        captureevents: true,
        xref: 'x',
        yref: 'y',
        showarrow: true,
        arrowhead: 10,
        ax: 0,
        ay: -60,
      },
    };
  }, [layout, config]);
  useEffect(() => {
    if (graph.current) {
      newPlot(graph.current, data, initial.layout, initial.config as Partial<Config>);
      if (enablePointEvent) {
        graph.current.on('plotly_click', (data: Data): void => {
          if (data.points.length > 0) {
            const { x, y, z } = data.points[0];
            setPoints({
              x,
              y,
              z,
            });
          }
        });
      }
    }
    return () => {
      if (graph.current) {
        purge(graph.current);
      }
    };
  }, [data, config, layout]);

  const redraw = (props: IGraphProps): void => {
    if (graph.current) {
      react(
        graph.current,
        props.data,
        props.layout ?? initial.layout,
        props.config ?? (initial.config as Partial<Config>),
      );
    }
  };
  /**
   * A function that handles screen resize events.
   *
   * @param {string | number} width - the new width of the screen
   * @param {string | number} height - the new height of the screen
   * @return {void}
   */
  const screenResize = (width: string | number, height: string | number): void => {
    relayout(graph.current, { width, height });
  };
  const download = (format: string, filename?: string, width?: number, height?: number): void => {
    downloadImage(graph.current, { format, width, height, filename });
  };
  const setAnnotations = (annotations: Annotations): void => {
    const createAnnotations = { ...initial.annotation, ...annotations };
    const allAnnotations: Annotations[] = [];
    if (graph.current.layout.annotations) {
      for (let i = 0; i < graph.current.layout.annotations?.length; i++) {
        allAnnotations.push(graph.current.layout.annotations[i]);
      }
    }
    allAnnotations.push(createAnnotations);
    relayout(graph.current, { annotations: allAnnotations });
  };
  const resetPoints = (): void => {
    setPoints(undefined);
  };
  return {
    graph,
    redraw,
    editedConfig,
    screenResize,
    download,
    setAnnotations,
    points,
    resetPoints,
  };
};
