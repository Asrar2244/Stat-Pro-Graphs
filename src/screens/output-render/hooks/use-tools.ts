import { useState } from 'react';
import { IToolBar } from '@utils';

export interface ITools extends IToolBar {
  showRunHistory: boolean;
  totalRuns: number;
  toggleShowHistory: () => void;
  toggleFontBold: () => void;
  toggleFontItalic: () => void;
  setFontSize: (value: number) => void;
  setFontColor: (value: string) => void;
  setTotalRuns: (value: number) => void;
}

export const useTools = (): ITools => {
  const [fontBold, setFontBold] = useState<boolean>(false);
  const [fontItalic, setFontItalic] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(0);
  const [fontColor, setFontColor] = useState<string>('');
  const [showRunHistory, setShowRunHistory] = useState<boolean>(true);
  const [totalRuns, setTotalRuns] = useState<number>(0);
  const toggleShowHistory = (): void => {
    setShowRunHistory(!showRunHistory);
  };
  const toggleFontBold = (): void => {
    setFontBold(!fontBold);
  };
  const toggleFontItalic = (): void => {
    setFontItalic(!fontItalic);
  };

  return {
    fontBold,
    toggleFontBold,
    fontItalic,
    toggleFontItalic,
    fontSize,
    setFontSize,
    fontColor,
    setFontColor,
    showRunHistory,
    toggleShowHistory,
    totalRuns,
    setTotalRuns,
  };
};
