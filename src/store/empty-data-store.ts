import { create } from 'zustand';
import { CellBase, Matrix, Selection } from 'react-spreadsheet';
interface IEmptyDataStore {
  data: Matrix<CellBase>;
  selectedCell: Selection | undefined;
  setData: (data: Matrix<CellBase>) => void;
  setSelectedCell: (selectedCell: Selection | undefined) => void;
}

export const useEmptyDataStore = create<IEmptyDataStore>((set) => ({
  data: [],
  selectedCell: undefined,
  setData(data): void {
    set(() => {
      return { data };
    });
  },
  setSelectedCell(selectedCell): void {
    set(() => {
      return { selectedCell };
    });
  },
}));
