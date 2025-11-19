import { useState, useEffect, useContext, useRef } from 'react';
import type { IPrintSection } from '../types';
import { detectPrintableSections, hasSignificantContent } from '../utils';
import { DATA_OUTPUT_ID_ATTR, OUTPUT_ROOT_SELECTOR } from '../utils/constants';
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
  
  // Cache expensive DOM queries with refs
  const allOutputContainersRef = useRef<NodeListOf<Element> | null>(null);
  const rootElementRef = useRef<HTMLElement | null>(null);
  const outputContainerRef = useRef<Element | null>(null);

  const loadSections = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the current output container by ID
      const currentOutputId = context?.selectedRun?.id;
      let rootElement: HTMLElement | undefined;
      
      if (currentOutputId) {
        // Look for the specific output container with the data-output-id attribute
        // Use cached ref if available and still valid
        if (rootElementRef.current && rootElementRef.current.getAttribute(DATA_OUTPUT_ID_ATTR) === currentOutputId.toString()) {
          rootElement = rootElementRef.current;
        } else {
          rootElement = document.querySelector(`[${DATA_OUTPUT_ID_ATTR}="${currentOutputId}"]`) as HTMLElement;
          rootElementRef.current = rootElement || null;
        }
        
        if (!rootElement) {
          setError(`Could not find the current output (ID: ${currentOutputId}). Please refresh the page.`);
          setSections([]);
          return;
        }
      } else {
        // Enhanced fallback: try to find the currently active output container
        // Strategy 1: Look for visible/active output containers
        // Use cached ref if available, otherwise query and cache
        if (!allOutputContainersRef.current) {
          allOutputContainersRef.current = document.querySelectorAll(`[${DATA_OUTPUT_ID_ATTR}]`);
        }
        const allOutputContainers = allOutputContainersRef.current;
        let activeContainer: HTMLElement | null = null;
        
        // Find the container that is currently visible/active
        for (const container of allOutputContainers) {
          const containerEl = container as HTMLElement;
          
          // Check if this container is visible and has content
          const isVisible = containerEl.offsetParent !== null || 
                           containerEl.style.display !== 'none' ||
                           containerEl.style.visibility !== 'hidden';
          
          const hasContent = containerEl.children.length > 0;
          
          // Check if this container is in the currently active tab
          const isInActiveTab = containerEl.closest(OUTPUT_ROOT_SELECTOR) !== null;
          if (isVisible && hasContent && isInActiveTab) {
            activeContainer = containerEl;
            break;
          }
        }
        
        if (activeContainer) {
          rootElement = activeContainer;
          rootElementRef.current = rootElement;
        } else {
          // Strategy 2: If no active container found, try to find any container with content
          for (const container of allOutputContainers) {
            const containerEl = container as HTMLElement;
            if (containerEl.children.length > 0) {
              // Check if it has meaningful content (cards, tables, etc.)
              // Use single query with combined selector for better performance
              const cards = containerEl.querySelectorAll('.fui-Card');
              const tables = containerEl.querySelectorAll('table');
              const charts = containerEl.querySelectorAll('svg, canvas');
              const hasCards = cards.length > 0;
              const hasTables = tables.length > 0;
              const hasCharts = charts.length > 0;
              
              if (hasCards || hasTables || hasCharts) {
                activeContainer = containerEl;
                break;
              }
            }
          }
          
          if (activeContainer) {
            rootElement = activeContainer;
            rootElementRef.current = rootElement;
          } else {
            setError('No active output containers found. Please open an output first.');
            setSections([]);
            return;
          }
        }
      }
      
      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let detectedSections = detectPrintableSections(rootElement);
      
      // If no sections found, wait a bit longer and try again (content might still be loading)
      if (detectedSections.length === 0) {
        // retry once after short delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        detectedSections = detectPrintableSections(rootElement);
        
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
      
      setSections(validSections);
      setAllSelected(true);
      
    } catch (err) {
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
      
      // Invalidate cached refs when output changes
      allOutputContainersRef.current = null;
      rootElementRef.current = null;
      outputContainerRef.current = null;
      
      await loadSections();
    }
  };

  // Force refresh sections (useful for manual refresh)
  const forceRefreshSections = async () => {
    // Reset the current output ID to force a fresh load
    setCurrentOutputId('');
    // Invalidate cached refs to force fresh queries
    allOutputContainersRef.current = null;
    rootElementRef.current = null;
    outputContainerRef.current = null;
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
    // Invalidate cached refs
    allOutputContainersRef.current = null;
    rootElementRef.current = null;
    outputContainerRef.current = null;
  };

  // Set modal open state
  const setModalOpen = (open: boolean) => {
    // Idempotent guard
    if (modalOpenRef.current === open) return;
    modalOpenRef.current = open;
    setIsModalOpen(open);
    if (open) {
      clearedOnceRef.current = false;
      // Force refresh sections when modal opens to ensure we get the current active output
      setTimeout(() => {
        void loadSections();
      }, 100);
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
  }, [context?.selectedRun?.id, context?.selectedRun?.outputFor, context?.selectedRun?.tabName]);

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

    // Find the main output container - use cached ref if available
    if (!outputContainerRef.current) {
      outputContainerRef.current = document.querySelector('[class*="regressionsLayout"], [class*="Layout"], [class*="content"]');
    }
    const outputContainer = outputContainerRef.current;
    
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

  // Additional effect to monitor for tab switches by watching for changes in the active output container
  useEffect(() => {
    if (!isModalOpen) return;

    // Function to check if the active output has changed
    const checkActiveOutputChange = () => {
      const newOutputId = context?.selectedRun?.id?.toString();
      if (newOutputId && newOutputId !== currentOutputId) {
        void forceRefreshSections();
      }
    };

    // Check periodically for output changes
    const interval = setInterval(checkActiveOutputChange, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [isModalOpen, context?.selectedRun?.id, currentOutputId]);

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