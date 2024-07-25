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
  name: string;
  recordType: IRecordTableType;
}
