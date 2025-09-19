import { useState } from 'react';

export const useTools = () => {
  const [fontBold, setFontBold] = useState(false);
  const [fontItalic, setFontItalic] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [fontColor, setFontColor] = useState('#000000');
  const [showRunHistory, setShowRunHistory] = useState(false);
  const [totalRuns, setTotalRuns] = useState(0);

  const toggleShowHistory = () => {
    setShowRunHistory(!showRunHistory);
  };

  return {
    fontBold,
    fontItalic,
    fontSize,
    fontColor,
    showRunHistory,
    totalRuns,
    setFontBold,
    setFontItalic,
    setFontSize,
    setFontColor,
    toggleShowHistory,
    setTotalRuns,
  };
};


