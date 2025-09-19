import { useState } from 'react';

export const useDropdownState = () => {
  const [testsOpen, setTestsOpen] = useState(false);
  const [graphsOpen, setGraphsOpen] = useState(false);

  const openTests = () => {
    setTestsOpen(true);
    if (graphsOpen) setGraphsOpen(false); // Close graphs if open
  };

  const closeTests = () => {
    setTestsOpen(false);
  };

  const toggleTests = () => {
    setTestsOpen((open) => !open);
    if (!testsOpen && graphsOpen) setGraphsOpen(false); // Close graphs if opening tests
  };

  const openGraphs = () => {
    setGraphsOpen(true);
    if (testsOpen) setTestsOpen(false); // Close tests if open
  };

  const closeGraphs = () => {
    setGraphsOpen(false);
  };

  const toggleGraphs = () => {
    setGraphsOpen((open) => !open);
    if (!graphsOpen && testsOpen) setTestsOpen(false); // Close tests if opening graphs
  };

  const closeAllDropdowns = () => {
    setTestsOpen(false);
    setGraphsOpen(false);
  };

  return {
    testsOpen,
    graphsOpen,
    openTests,
    closeTests,
    toggleTests,
    openGraphs,
    closeGraphs,
    toggleGraphs,
    closeAllDropdowns,
  };
};



