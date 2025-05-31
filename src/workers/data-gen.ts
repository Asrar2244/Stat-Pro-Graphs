import { CellBase, Matrix } from 'react-spreadsheet';

export const arrayArrayString = (data: Matrix<CellBase>) => {
  const newData: Array<Array<string>> = [];
  for (let i = 0; i < data.length; i++) {
    const row: Array<string> = [];
    for (let j = 0; j < data[i].length; j++) {
      const cell = data[i][j];
      if (cell?.value) {
        row.push(cell.value);
      }
    }
    if (row.length > 0) {
      newData.push(row);
    }
  }
  return newData;
};
export const getFormattedData = (data: Matrix<CellBase>, columns: Record<string, string>) => {
  const rows = data.map((row) => row.filter((f) => f?.value).map((cell) => cell?.value ?? ''));
  return rows;
};
