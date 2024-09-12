export interface ICardColumns {
  card: Array<ICardInterface>;
}
export interface ICardInterface {
  name: string;
  showCaption: boolean;
  columnCount?: Number;
  columns: Array<ICardColumnInterface>;
}

export interface ICardColumnInterface {
  type: 'static' | 'dynamic';
  path?: string;
  label?: string;
  rows: Array<ICardColumnRowsInterface>;
}
export interface ICardColumnRowsInterface {
  label?: string;
  path?: string;
}
