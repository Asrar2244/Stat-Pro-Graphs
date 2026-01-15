import { useState, useCallback } from 'react';

export const useDropdownState = () => {
  const [testsOpen, setTestsOpen] = useState(false);
  const [graphsOpen, setGraphsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pinned, setPinned] = useState(true);

  const openTests = useCallback(() => {
    setTestsOpen(true);
    if (graphsOpen) setGraphsOpen(false);
    if (helpOpen) setHelpOpen(false);
  }, [graphsOpen, helpOpen]);

  const closeTests = useCallback(() => {
    setTestsOpen(false);
  }, []);

  const toggleTests = useCallback(() => {
    if (testsOpen) {
      setTestsOpen(false);
    } else {
      setGraphsOpen(false);
      setHelpOpen(false);
      setTestsOpen(true);
    }
  }, [testsOpen]);

  const openGraphs = useCallback(() => {
    setGraphsOpen(true);
    if (testsOpen) setTestsOpen(false);
    if (helpOpen) setHelpOpen(false);
  }, [testsOpen, helpOpen]);

  const closeGraphs = useCallback(() => {
    setGraphsOpen(false);
  }, []);

  const toggleGraphs = useCallback(() => {
    if (graphsOpen) {
      setGraphsOpen(false);
    } else {
      setTestsOpen(false);
      setHelpOpen(false);
      setGraphsOpen(true);
    }
  }, [graphsOpen]);

  const openHelp = useCallback(() => {
    setHelpOpen(true);
    if (testsOpen) setTestsOpen(false);
    if (graphsOpen) setGraphsOpen(false);
  }, [testsOpen, graphsOpen]);

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
  }, []);

  const toggleHelp = useCallback(() => {
    if (helpOpen) {
      setHelpOpen(false);
    } else {
      setTestsOpen(false);
      setGraphsOpen(false);
      setHelpOpen(true);
    }
  }, [helpOpen]);

  const closeAllDropdowns = useCallback(() => {
    setTestsOpen(false);
    setGraphsOpen(false);
    setHelpOpen(false);
  }, []);

  return {
    testsOpen,
    graphsOpen,
    helpOpen,
    pinned,
    setPinned,
    openTests,
    closeTests,
    toggleTests,
    openGraphs,
    closeGraphs,
    toggleGraphs,
    openHelp,
    closeHelp,
    toggleHelp,
    closeAllDropdowns,
  };
};









