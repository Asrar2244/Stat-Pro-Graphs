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
  setReset: () => void;
}
export type IBasicTypes =
  | 'mainSelectedList'
  | 'mainOptions'
  | 'mainTermedMean'
  | 'mainWeightedMean';
const initial = {
  mainOptions: {
    allOptions: false,
    isN: false,
    isMedian: false,
    isRange: false,
    isMin: false,
    isMode: false,
    isInterquartileRange: false,
    isMax: false,
    isGeoMean: false,
    isSkewness: false,
    isSum: false,
    isHarmonicMean: false,
    isSEofSkewness: false,
    isArithMean: false,
    isSD: false,
    isKurtosis: false,
    isSEofAM: false,
    isCV: false,
    isSEofKurtosis: false,
    CIofAM: '0.95',
    isVariance: false,
    isShaprioWilk: false,
    isAndersonDarling: false,
    isMardiaSkewness: false,
    isMardiaKurtosis: false,
    isHenzeZirkler: false,
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
};
export const useBasicStatistics = create<IBasicStatics>((set) => ({
  ...initial,
  setMain: (type: IBasicTypes, value: IItems | string[]): void => {
    set((state: IBasicStatics) => {
      const mainType = state[type];
      if (type === 'mainSelectedList' && Array.isArray(value)) return { [type]: value };
      return { [type]: { ...mainType, ...value } };
    });
  },
  setReset: () => {
    set(() => {
      return { ...initial };
    });
  },
}));
