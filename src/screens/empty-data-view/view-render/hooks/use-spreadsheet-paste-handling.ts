import { useRef } from 'react';

interface UseSpreadsheetPasteHandlingProps {
  handleEditEnded: (updatedCell: any, data: any) => void;
}

export const useSpreadsheetPasteHandling = ({
  handleEditEnded,
}: UseSpreadsheetPasteHandlingProps) => {
  const handleEditEndedRef = useRef(handleEditEnded);
  
  // Keep ref up to date
  handleEditEndedRef.current = handleEditEnded;

  // CRITICAL: Completely disabled paste handling to prevent remounts
  // The ExcelSpreadsheet library handles paste internally, and any interference
  // (including state updates for loading overlays) causes the component to remount
  // and reset state. We must let the library handle paste completely on its own.

  // Return false to disable the loading overlay
  // This prevents any re-renders that could trigger remounts
  return { isPasting: false };
};
