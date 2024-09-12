import { Data, Layout, Config } from 'plotly.js';

export interface ISelectedRun {
  id: number;
  modifiedDateTime: string;
  outputFor: string;
  tabName: string;
  outputType: string;
  result: {
    output_table_name: string;
  };
}

export interface IToolBar {
  fontBold: boolean;
  fontItalic: boolean;
  fontSize: number;
  fontColor: string;
}

export interface ITranslate {
  t: (key: string | string[], option?: any) => string;
}

export type IRecordTableType =
  | undefined
  | boolean
  | {
      pageSize: number;
    };

export interface ITableCreator {
  showHeaders?: boolean;
  showCaption?: boolean;
  view: Array<string> | Array<Array<string>>;
  name?: string;
  recordType: IRecordTableType;
  translationColumns?: Array<number>;
  type?: 'columns';
  appendColumn?: Array<string>;
  postfix?: string;
  prefix?: string;
}

interface IGraphAxis {
  x: string | string[];
  y: string | string[];
  z?: string | string[];
  type?: string;
  name?: string;
}
interface IGraphDownload {
  format: string;
  description?: string;
}
export interface IGraph {
  traces: { [key: string]: IGraphAxis };
  modes?: string[];
  download?: IGraphDownload[];
  title?: string;
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  multipleTraces?: {
    commonAxis: string;
    multipleAxis: string;
  };
}
export interface IGraphRef {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  title?: string;
  supportedGraph?: string[];
  enablePointEvent?: boolean;
}
