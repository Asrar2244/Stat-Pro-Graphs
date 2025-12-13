import { useState } from 'react';

export const useDropdownState = () => {
  const [testsOpen, setTestsOpen] = useState(false);
  const [graphsOpen, setGraphsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pinned, setPinned] = useState(false);

  const openTests = () => {
    setTestsOpen(true);
    if (graphsOpen) setGraphsOpen(false);
    if (helpOpen) setHelpOpen(false);
  };

  const closeTests = () => {
    setTestsOpen(false);
  };

  const toggleTests = () => {
    if (testsOpen) {
      setTestsOpen(false);
    } else {
      if (graphsOpen) setGraphsOpen(false);
      if (helpOpen) setHelpOpen(false);
      setTestsOpen(true);
    }
  };

  const openGraphs = () => {
    setGraphsOpen(true);
    if (testsOpen) setTestsOpen(false);
    if (helpOpen) setHelpOpen(false);
  };

  const closeGraphs = () => {
    setGraphsOpen(false);
  };

  const toggleGraphs = () => {
    if (graphsOpen) {
      setGraphsOpen(false);
    } else {
      if (testsOpen) setTestsOpen(false);
      if (helpOpen) setHelpOpen(false);
      setGraphsOpen(true);
    }
  };

  const openHelp = () => {
    setHelpOpen(true);
    if (testsOpen) setTestsOpen(false);
    if (graphsOpen) setGraphsOpen(false);
  };

  const closeHelp = () => {
    setHelpOpen(false);
  };

  const toggleHelp = () => {
    if (helpOpen) {
      setHelpOpen(false);
    } else {
      if (testsOpen) setTestsOpen(false);
      if (graphsOpen) setGraphsOpen(false);
      setHelpOpen(true);
    }
  };

  const closeAllDropdowns = () => {
    setTestsOpen(false);
    setGraphsOpen(false);
    setHelpOpen(false);
  };

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









