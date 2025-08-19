import { useState, useEffect, useContext, useRef } from 'react';
import type { IPrintSection } from '../types';
import { detectPrintableSections, hasSignificantContent } from '../utils';
import { OutputRenderContext } from '../../context';

export const usePrintSections = () => {
  const [sections, setSections] = useState<IPrintSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allSelected, setAllSelected] = useState(true);
  const context = useContext(OutputRenderContext);
  
  // Track the current output to detect changes
  const [currentOutputId, setCurrentOutputId] = useState<string>('');
  
  // Prevent multiple simultaneous refreshes
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Track if modal is open to prevent unnecessary refreshes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalOpenRef = useRef(false);
  const clearedOnceRef = useRef(false);
  const refreshTimerRef = useRef<number | null>(null);

  const loadSections = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setIsLoading(true);
    setError(null);
    
    try {
      // light scan
      
      // More detailed DOM inspection
      // const allDivs = document.querySelectorAll('div[class*="regressions"], div[class*="Layout"], div[class*="content"], div[class*="Container"]');
      
      
      // const allCards = document.querySelectorAll('[class*="Card"], [class*="card"], .fui-Card');
      
      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let detectedSections = detectPrintableSections();
      console.log(`🔍 Detected ${detectedSections.length} sections`);
      
      // If no sections found, wait a bit longer and try again (content might still be loading)
      if (detectedSections.length === 0) {
        // retry once after short delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        
        detectedSections = detectPrintableSections();
        
      }
      
      // Filter out sections without significant content
      const validSections = detectedSections.filter(section => {
        const isValid = hasSignificantContent(section.element);
        return isValid;
      });
      
      if (validSections.length === 0) {
        setError('No printable sections found in the current output.');
        setSections([]);
        return;
      }
      
      console.log(`✅ ${validSections.length} sections ready`);
      setSections(validSections);
      setAllSelected(true);
      
    } catch (err) {
      console.error('❌ Error loading sections:', err);
      setError('Failed to load printable sections.');
      setSections([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const toggleSelectAll = () => {
    const newSelected = !allSelected;
    setSections(prev => prev.map(section => ({ ...section, selected: newSelected })));
    setAllSelected(newSelected);
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => {
      const updated = prev.map(section => 
        section.id === sectionId 
          ? { ...section, selected: !section.selected }
          : section
      );
      
      // Update allSelected based on current state
      const selectedCount = updated.filter(s => s.selected).length;
      setAllSelected(selectedCount === updated.length);
      
      return updated;
    });
  };

  const getSelectedSections = () => {
    return sections.filter(section => section.selected);
  };

  const getSelectedCount = () => {
    return sections.filter(section => section.selected).length;
  };

  // Check if output has changed and refresh sections if needed
  const checkAndRefreshSections = async () => {
    const newOutputId = `${context?.selectedRun?.id}-${context?.selectedRun?.outputFor}`;
    
    if (newOutputId !== currentOutputId) {
      
      setCurrentOutputId(newOutputId);
      
      // Clear old sections before loading new ones
      setSections([]);
      setError(null);
      
      await loadSections();
    }
  };

  // Force refresh sections (useful for manual refresh)
  const forceRefreshSections = async () => {
    // Reset the current output ID to force a fresh load
    setCurrentOutputId('');
    // Debounce to avoid rapid re-entrancy
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = window.setTimeout(() => {
      void loadSections();
    }, 300);
  };

  // Clear sections (useful when modal closes or switching outputs)
  const clearSections = () => {
    setSections([]);
    setError(null);
    setCurrentOutputId('');
  };

  // Set modal open state
  const setModalOpen = (open: boolean) => {
    // Idempotent guard
    if (modalOpenRef.current === open) return;
    modalOpenRef.current = open;
    setIsModalOpen(open);
    if (open) {
      clearedOnceRef.current = false;
    } else {
      // Clear only once per close transition
      if (!clearedOnceRef.current) {
        clearSections();
        clearedOnceRef.current = true;
        // Reset the flag on next tick
        setTimeout(() => { clearedOnceRef.current = false; }, 0);
      }
    }
  };

  // Load sections when hook is first used
  useEffect(() => {
    loadSections();
  }, []);

  // Watch for output changes and refresh sections
  useEffect(() => {
    if (context?.selectedRun) {
      checkAndRefreshSections();
    } else {
      // Context is undefined, clear sections
      clearSections();
    }
  }, [context?.selectedRun?.id, context?.selectedRun?.outputFor]);

  // Watch for tab name changes (user switching between different outputs)
  useEffect(() => {
    if (context?.selectedRun?.tabName) {
      // Clear sections when tab changes to force fresh detection
      setSections([]);
      setError(null);
      setCurrentOutputId('');
      // Schedule a refresh after a short delay to let the new content load
      setTimeout(() => {
        if (isModalOpen) {
          loadSections();
        }
      }, 500);
    }
  }, [context?.selectedRun?.tabName, isModalOpen]);

  // Watch for page visibility changes (user switching tabs or returning to page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isModalOpen && context?.selectedRun) {
        // Small delay to let content settle
        setTimeout(() => {
          forceRefreshSections();
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isModalOpen, context?.selectedRun]);

  // Watch for page load events (user refreshed the page)
  useEffect(() => {
    const handlePageLoad = () => {
      if (isModalOpen && context?.selectedRun) {
        console.log('🔄 Page loaded, refreshing sections...');
        // Longer delay to let all content load
        setTimeout(() => {
          forceRefreshSections();
        }, 1000);
      }
    };

    window.addEventListener('load', handlePageLoad);
    
    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, [isModalOpen, context?.selectedRun]);

  // Watch for DOM changes in the output area and refresh sections if needed
  useEffect(() => {
    if (!context?.selectedRun) return;

    // Find the main output container
    const outputContainer = document.querySelector('[class*="regressionsLayout"], [class*="Layout"], [class*="content"]');
    
    if (!outputContainer) {
      return;
    }

    
    
    // Create a mutation observer to watch for content changes
    const observer = new MutationObserver((mutations) => {
      let shouldRefresh = false;
      
      mutations.forEach((mutation) => {
        // Check if the mutation affects content that might be printable
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          const target = mutation.target as HTMLElement | null;
          if (target && (
            target.querySelector?.('table') ||
            target.querySelector?.('svg') ||
            target.querySelector?.('canvas') ||
            target.querySelector?.('[class*="plotly"]') ||
            (target.textContent && target.textContent.trim().length > 100)
          )) {
            shouldRefresh = true;
          }
        }
      });
      
      if (shouldRefresh) {
        // Debounce the refresh to avoid multiple rapid updates
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }
        refreshTimerRef.current = window.setTimeout(() => {
          if (currentOutputId) { // Only refresh if we have a current output
            void forceRefreshSections();
          }
        }, 800);
      }
    });
    
    // Start observing
    observer.observe(outputContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // Cleanup observer on unmount or output change
    return () => {
      observer.disconnect();
    };
  }, [context?.selectedRun?.id, currentOutputId]);

  return {
    sections,
    setSections,
    isLoading,
    error,
    allSelected,
    setAllSelected,
    toggleSelectAll,
    toggleSection,
    getSelectedSections,
    getSelectedCount,
    loadSections,
    checkAndRefreshSections,
    forceRefreshSections,
    clearSections,
    setModalOpen,
  };
};