import { useContext, useMemo, useRef, useEffect } from 'react';
import { EmptyDataContext } from '../context';
import { ExcelSpreadsheet } from 'excel-lib';
import { useSpreadsheetPasteHandling } from './hooks/use-spreadsheet-paste-handling';
import { PasteLoadingOverlay } from './paste-loading-overlay';
import { useSpreadsheetTheme } from './hooks/use-spreadsheet-theme';
import { useSpreadsheetData, useSpreadsheetPasteImmediateFix, convertExcelDataToMatrix } from './hooks/use-spreadsheet-data';
import { useUniverCommandListener } from './hooks/use-univer-command-listener';
import { useSpreadsheetImport } from './hooks/use-spreadsheet-import';
import { importExcelData, prepareExcelImport, processAndOpenNewTab } from '@utils/spreadsheet-import';
import { useEmptyDataStore } from '@store';
import { useActiveNode, useNodeActions } from '@hooks';
import { ImportOptionsModal } from './import-options-modal';
import { SheetSelectionModal } from './sheet-selection-modal';
import { useState, useCallback } from 'react';
import { uniqueNumber } from '@utils';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

export const ViewRender = () => {
  const { setData, setDataState, dataState, storageKey, workspacePath, nodeId, nodeConfig, data, projectId } = useContext(EmptyDataContext);
  const { openNewTab } = useNodeActions();
  const { t } = useTranslation('workspace');
  const viewRef = useRef<HTMLDivElement>(null);

  // CRITICAL: Make INIT_DATA_KEY unique per tab using storageKey
  // This prevents tabs from overwriting each other's initial data
  const INIT_DATA_KEY = useMemo(() => `excel-spreadsheet-initial-data-${storageKey || 'default'}`, [storageKey]);

  // Use the spreadsheet data hook for all content-related operations
  const {
    handleSave,
    handleEditEnded,
    initialData,
    setInitialData, // Get setter to update grid manually
    isLoadingData,
    spreadsheetKey,
    spreadsheetStyle,
    eventAfterEditEndedCallback
  } = useSpreadsheetData(INIT_DATA_KEY, storageKey, workspacePath, nodeId, nodeConfig);

  // Hook to handle immediate numeric conversion on paste using Univer API
  useSpreadsheetPasteImmediateFix(setData, setDataState, dataState);

  // Hook to listen for row/col deletion and clear commands to trigger draft mode
  useUniverCommandListener(setDataState, dataState);

  // State for import options modal
  const [showImportOptionsModal, setShowImportOptionsModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<{ fileData: string[][], filePath: string, dbPath?: string } | null>(null);

  // Callback to show import modal when importing into saved project
  const handleShowImportModal = useCallback((fileData: string[][], filePath: string, dbPath?: string) => {
    setPendingImportData({ fileData, filePath, dbPath });
    setShowImportOptionsModal(true);
  }, []);

  // For Excel sheet selection
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [sheetSelectionData, setSheetSelectionData] = useState<{ sheetNames: string[], linuxPath: string, savePath: string, fileName: string } | null>(null);

  const handleShowSheetSelection = useCallback((sheetNames: string[], linuxPath: string, savePath: string, fileName: string) => {
    setSheetSelectionData({ sheetNames, linuxPath, savePath, fileName });
    setShowSheetModal(true);
  }, []);

  // Use the spreadsheet import hook for file import functionality
  const { handleImport, appendToExistingData, processImportedData } = useSpreadsheetImport(
    setData,
    setDataState,
    setInitialData,
    projectId,
    dataState,
    handleShowImportModal,
    handleShowSheetSelection
  );

  // Handle import in same view (append mode)
  const handleImportInSameView = useCallback(async () => {
    if (!pendingImportData || !data) return;
    try {
      await appendToExistingData(pendingImportData.fileData, data);
      setPendingImportData(null);
      setShowImportOptionsModal(false);
    } catch (error) {
      console.error('Failed to append data:', error);
      alert('Failed to import data. Please try again.');
    }
  }, [pendingImportData, data, appendToExistingData]);

  // Handle open new view (create new tab with imported data)
  const handleOpenNewView = useCallback(async () => {
    if (!pendingImportData) return;

    await processAndOpenNewTab(
      pendingImportData.fileData,
      pendingImportData.filePath,
      openNewTab,
      t,
      pendingImportData.dbPath // Pass the cleaned DB path
    );

    setPendingImportData(null);
    setShowImportOptionsModal(false);
  }, [pendingImportData, openNewTab, t]);

  // Handle sheet selection confirmation
  const handleSheetConfirm = useCallback(async (sheetName: string) => {
    if (!sheetSelectionData) return;
    try {
      const { fileData } = await importExcelData(sheetSelectionData.linuxPath, sheetSelectionData.savePath, sheetName);
      if (processImportedData) {
        processImportedData(fileData, sheetSelectionData.savePath);
      }
    } catch (e: any) {
      console.error('Failed to import sheet:', e);
      alert(`Failed to import sheet: ${e.message}`);
    } finally {
      setShowSheetModal(false);
      setSheetSelectionData(null);
    }
  }, [sheetSelectionData, processImportedData]);

  const isDarkMode = useSpreadsheetTheme();

  // // Handle paste detection and loading states
  // const { isPasting } = useSpreadsheetPasteHandling({
  //   handleEditEnded,
  // });

  // // CRITICAL: Use refs to keep callbacks stable and prevent remounts
  // // This ensures customButtons never changes, preventing ExcelSpreadsheet remounts
  // const handleSaveRef = useRef(handleSave);
  // const handleImportRef = useRef(handleImport);

  // // Update refs when callbacks change (but don't recreate customButtons)
  // useEffect(() => {
  //   handleSaveRef.current = handleSave;
  // }, [handleSave]);

  useEffect(() => {
    handleImportRef.current = handleImport;
  }, [handleImport]);

  // CRITICAL: Memoize custom buttons with stable refs - never changes after first render
  // This prevents ExcelSpreadsheet from remounting when handleSave/handleImport change
  const customButtons = useMemo(() => [
    {
      name: "import",
      label: "Import File",
      icon: "FolderIcon" as const,
      dataRequired: false as any,
      onClick: async () => {
        await handleImportRef.current();
      }
    },
    {
      name: "save",
      label: "Save Data",
      icon: "AddNoteIcon" as const,
      dataRequired: true as any,
      onClick: (result: any) => {
        handleSaveRef.current(result);
      }
    }
  ], []); // CRITICAL: Empty deps - buttons never change, preventing remounts

  // Memoize darkMode and footer to prevent unnecessary re-renders (only changes when theme actually changes)
  const darkModeValue = useMemo(() => isDarkMode, [isDarkMode]);
  const footerConfig = useMemo(() => ({ sheetBar: false, statisticBar: true, zoomSlider: true }), []);

  // Listen for global save requests (e.g. from analysis execution)
  const { saveRequest } = useEmptyDataStore();
  const prevSaveRequestRef = useRef(saveRequest);

  // data is already available from context (line 15)

  // CRITICAL: Get active node to ensure we only save the correctly targeted tab
  const activeNode = useActiveNode([saveRequest]);

  // Handle paste detection and loading states
  const { isPasting } = useSpreadsheetPasteHandling({
    handleEditEnded,
  });

  // CRITICAL: Use refs to keep callbacks stable and prevent remounts
  // This ensures customButtons never changes, preventing ExcelSpreadsheet remounts
  const handleSaveRef = useRef(handleSave);
  const handleImportRef = useRef(handleImport);

  // Update refs when callbacks change (but don't recreate customButtons)
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  useEffect(() => {
    // Only trigger if saveRequest incremented
    if (saveRequest > prevSaveRequestRef.current) {
      prevSaveRequestRef.current = saveRequest;

      // 1. Check if THIS tab is the one being saved (the active one)
      // This prevents all open tabs from trying to save at once
      const isActive = activeNode?.id === nodeId;
      if (!isActive) {
        return;
      }

      // 2. Aggressive search for the actual toolbar button to "act as if clicked"
      const container = viewRef.current;
      if (container) {
        const allElements = Array.from(container.querySelectorAll('*'));
        let targetButton: HTMLElement | null = null;

        for (const el of allElements) {
          const text = (el.textContent || "").trim();
          const aria = el.getAttribute('aria-label') || "";
          const title = el.getAttribute('title') || "";
          const nameAttr = el.getAttribute('name') || "";
          const dataName = el.getAttribute('data-name') || "";
          const html = el.innerHTML;

          const isMatch =
            text.toLowerCase().includes("save data") ||
            aria.toLowerCase().includes("save data") ||
            title.toLowerCase().includes("save data") ||
            (text.toLowerCase() === "save" && (el.tagName === "BUTTON" || el.getAttribute("role") === "button")) ||
            html.includes("AddNoteIcon") ||
            html.includes("add-note-icon") ||
            html.includes("save-icon") ||
            html.includes("M17 3H5") || // Common save icon path start
            nameAttr.includes("save") ||
            dataName.includes("save") ||
            (el.classList && el.classList.contains("univer-button") && text === "");

          if (isMatch) {
            // Find the closest clickable parent or the element itself
            const clickable = el.closest('button, [role="button"], .univer-button, .excel-spreadsheet-toolbar-button, .univer-toolbar-item, [onclick]') as HTMLElement;
            if (clickable) {
              targetButton = clickable;
              break;
            }
          }
        }

        if (targetButton) {
          targetButton.click();
          return;
        }
      }

      // 3. Fallback: Use the internal handleSave direct call if button click simulation fails
      if (handleSaveRef.current) {
        // Explicitly pass the current data from context as a backup
        handleSaveRef.current({ data: data });
      }
    }
  }, [saveRequest, activeNode?.id, nodeId, data]); // Added data to dependencies to ensure fallback uses latest data

  // CRITICAL: Capture paste and drop events to ensure 'draft' state is set
  // This is a fallback in case the spreadsheet component doesn't trigger edit events correctly
  const handleInteractionCapture = () => {
    if (setDataState) {
      setDataState('draft');
    }
  };

  return (
    <div
      ref={viewRef}
      className={`spreadsheet-container status-${dataState || 'published'}`}
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onPasteCapture={handleInteractionCapture}
      onDropCapture={handleInteractionCapture}
    >
      <ExcelSpreadsheet
        key={spreadsheetKey}
        style={spreadsheetStyle}
        // CRITICAL: initialData NEVER changes after first mount
        // The spreadsheet manages its own state internally after initialization
        initialData={initialData}
        customButtons={customButtons}
        showToolbar={true}
        footer={footerConfig}
        darkMode={darkModeValue as any}
        editingRequiredFullData={false}
        eventAfterEditEnded={eventAfterEditEndedCallback}
      />
      <PasteLoadingOverlay isVisible={isPasting} isDarkMode={isDarkMode} />
      <PasteLoadingOverlay isVisible={isLoadingData} isDarkMode={isDarkMode} label="Loading data..." />

      {/* Import Options Modal */}
      <ImportOptionsModal
        open={showImportOptionsModal}
        onClose={() => setShowImportOptionsModal(false)}
        onImportInSameView={handleImportInSameView}
        onOpenNewView={handleOpenNewView}
      />

      {sheetSelectionData && (
        <SheetSelectionModal
          open={showSheetModal}
          sheetNames={sheetSelectionData.sheetNames}
          onClose={() => setShowSheetModal(false)}
          onConfirm={handleSheetConfirm}
        />
      )}
    </div>
  );
};
