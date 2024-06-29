import { create } from 'zustand';

interface IItems {
  [key: string]: boolean | string | number | Array<any>;
}
interface IBasicStatics {
  mainSelectedList: string[];
  mainOptions: IItems;
  mainTermedMean: IItems;
  mainWeightedMean: IItems;
  setMain: (type: IBasicTypes, value: IItems | string[]) => void;
}
export type IBasicTypes =
  | 'mainSelectedList'
  | 'mainOptions'
  | 'mainTermedMean'
  | 'mainWeightedMean';
export const useBasicStatistics = create<IBasicStatics>((set) => ({
  mainOptions: {
    allOptions: false,
    n: false,
    median: false,
    range: false,
    minimum: false,
    mode: false,
    integuartileRange: false,
    maximum: false,
    geometricMean: false,
    skeewness: false,
    sum: false,
    harmonicMean: false,
    seOfSkewness: false,
    arithmeticMean: false,
    sd: false,
    kurtosis: false,
    seOfAm: false,
    cv: false,
    seOfKutosis: false,
    ciOfAm: false,
    ciOfAmValue: '0.95',
    variance: false,
  },
  mainSelectedList: [],
  mainTermedMean: {
    selectAllTrimMean: false,
    twoTrimMeanSided: '',
    twoTrimMeanSidedValue: '0.1',
    ciOfTM: false,
    ciOfTMValue: '0.95',
  },
  mainWeightedMean: {
    selectAllWinsorizedMean: false,
    twoWinsorizedMeanSided: 'Two Sided',
    twoWinsorizedMeanSidedValue: '0.1',
    seOfWM: false,
    ciOfWM: false,
    ciOfWMValue: '0.95',
  },
  setMain: (type: IBasicTypes, value: IItems | string[]): void => {
    set((state: IBasicStatics) => {
      const mainType = state[type];
      if (type === 'mainSelectedList' && Array.isArray(value)) return { [type]: value };
      return { [type]: { ...mainType, ...value } };
    });
  },
}));
