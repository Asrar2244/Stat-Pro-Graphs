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
    setTestsOpen((open) => {
      const newOpen = !open;
      // Close graphs if opening tests
      if (newOpen && graphsOpen) setGraphsOpen(false);
      return newOpen;
    });
  };

  const openGraphs = () => {
    setGraphsOpen(true);
    if (testsOpen) setTestsOpen(false); // Close tests if open
  };

  const closeGraphs = () => {
    setGraphsOpen(false);
  };

  const toggleGraphs = () => {
    setGraphsOpen((open) => {
      const newOpen = !open;
      // Close tests if opening graphs
      if (newOpen && testsOpen) setTestsOpen(false);
      return newOpen;
    });
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









