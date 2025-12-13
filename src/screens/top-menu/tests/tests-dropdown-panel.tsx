import React, { FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { tokens } from '@fluentui/react-components';
import { MdArrowDropDown } from 'react-icons/md';
import { MdOutlinePushPin, MdPushPin } from 'react-icons/md';
import { SampleSizeModalWrapper, sampleSizeOptions } from '../sample-size';
import { useTests } from './use-tests';
import { useTestsStyles } from './styles-hook/use-tests-styles';
import { analysisOptions, advancedOptions } from './constants';
import type { TestsDropdownPanelProps } from './types';

export const TestsDropdownPanel: FC<TestsDropdownPanelProps> = ({ open, onClose, setMenuItem, pinned: propPinned, setPinned: propSetPinned, openSampleSizeModal }) => {
  const styles = useTestsStyles();
  const [localPinned, setLocalPinned] = useState(false);
  const pinned = propPinned !== undefined ? propPinned : localPinned;
  const setPinned = propSetPinned || setLocalPinned;
  const onCloseIfNotPinned = () => { if (!pinned) onClose(); };

  const {
    selectedAnalysis,
    selectedAdvanced,
    showAnalysisDropdown,
    showAdvancedDropdown,
    showSampleSizeDropdown,
    selectedSampleSize,
    showSampleSizeModal,
    analysisSearchTerm,
    sampleSizeSearchTerm,
    advancedSearchTerm,
    filteredAnalysisOptions,
    filteredSampleSizeOptions,
    filteredAdvancedOptions,
    setShowAnalysisDropdown,
    setShowAdvancedDropdown,
    setShowSampleSizeDropdown,
    setAnalysisSearchTerm,
    setSampleSizeSearchTerm,
    setAdvancedSearchTerm,
    handleAnalysisChange,
    handleAdvancedChange,
    handleSampleSizeChange,
    getDisplayText,
    closeAllDropdowns,
    closeSampleSizeModal,
    openDropdown,
  } = useTests(setMenuItem, onCloseIfNotPinned);

  if (!open) return null;

  // Measure available space inside the panel and cap inner dropdowns to fit
  const panelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const analysisTriggerRef = useRef<HTMLDivElement | null>(null);
  const sampleTriggerRef = useRef<HTMLDivElement | null>(null);
  const advancedTriggerRef = useRef<HTMLDivElement | null>(null);
  const analysisDropdownRef = useRef<HTMLDivElement | null>(null);
  const sampleDropdownRef = useRef<HTMLDivElement | null>(null);
  const advancedDropdownRef = useRef<HTMLDivElement | null>(null);
  const isOpeningDropdownRef = useRef(false);
  const isOpeningModalRef = useRef(false);

  // Fixed-position dropdown coordinates
  const [analysisMenuStyle, setAnalysisMenuStyle] = useState<React.CSSProperties>({});
  const [sampleMenuStyle, setSampleMenuStyle] = useState<React.CSSProperties>({});
  const [advancedMenuStyle, setAdvancedMenuStyle] = useState<React.CSSProperties>({});

  const computeFixedMenu = (trigger: HTMLElement | null): React.CSSProperties => {
    if (!trigger) return {};
    const r = trigger.getBoundingClientRect();
    return {
      position: 'fixed',
      top: `${r.bottom + 2}px`,
      left: `${r.left}px`,
      width: `${r.width}px`,
      minWidth: `${r.width}px`,
      right: 'auto',
      zIndex: 1000002,
    };
  };

  useEffect(() => {
    if (showAnalysisDropdown && analysisTriggerRef.current) {
      const updatePosition = () => {
        const style = computeFixedMenu(analysisTriggerRef.current);
        setAnalysisMenuStyle(style);
      };
      updatePosition();
      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else if (!showAnalysisDropdown) {
      setAnalysisMenuStyle({});
    }
  }, [showAnalysisDropdown]);

  useEffect(() => {
    if (showSampleSizeDropdown && sampleTriggerRef.current) {
      const updatePosition = () => {
        const style = computeFixedMenu(sampleTriggerRef.current);
        setSampleMenuStyle(style);
      };
      updatePosition();
      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else if (!showSampleSizeDropdown) {
      setSampleMenuStyle({});
    }
  }, [showSampleSizeDropdown]);

  useEffect(() => {
    if (showAdvancedDropdown && advancedTriggerRef.current) {
      const updatePosition = () => {
        const style = computeFixedMenu(advancedTriggerRef.current);
        setAdvancedMenuStyle(style);
      };
      updatePosition();
      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else if (!showAdvancedDropdown) {
      setAdvancedMenuStyle({});
    }
  }, [showAdvancedDropdown]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!showAnalysisDropdown && !showAdvancedDropdown && !showSampleSizeDropdown) return;
    
    const handleDocumentClick = (e: MouseEvent) => {
      // Don't close if we're in the process of opening a dropdown
      if (isOpeningDropdownRef.current) return;
      
      const target = e.target as HTMLElement;
      
      // Don't close if clicking on search inputs
      if (target.closest('[data-search-input]') || target.tagName === 'INPUT') return;
      
      // Don't close if clicking on container or dropdowns
      if (containerRef.current && containerRef.current.contains(target)) return;
      if (analysisDropdownRef.current && analysisDropdownRef.current.contains(target)) return;
      if (sampleDropdownRef.current && sampleDropdownRef.current.contains(target)) return;
      if (advancedDropdownRef.current && advancedDropdownRef.current.contains(target)) return;
      if (analysisTriggerRef.current && analysisTriggerRef.current.contains(target)) return;
      if (sampleTriggerRef.current && sampleTriggerRef.current.contains(target)) return;
      if (advancedTriggerRef.current && advancedTriggerRef.current.contains(target)) return;
      if (target.closest('[data-dropdown-trigger]')) return;
      if (target.closest('.dropdown-content')) return;
      
      // Close all dropdowns
      closeAllDropdowns();
    };
    
    // Use setTimeout to avoid immediate closure - longer delay to allow dropdown to open
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleDocumentClick, true);
    }, 300);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [showAnalysisDropdown, showAdvancedDropdown, showSampleSizeDropdown, closeAllDropdowns]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent closing if we're in the process of opening a dropdown or modal
    if (isOpeningDropdownRef.current || isOpeningModalRef.current) {
      isOpeningDropdownRef.current = false;
      return;
    }
    
    // Only close if clicking directly on backdrop, not on any child elements
    const target = e.target as HTMLElement;
    if (target !== e.currentTarget) return;
    
    // Don't close if clicking on container or any of its children
    if (containerRef.current && containerRef.current.contains(target)) return;
    
    // Don't close if clicking on any dropdown content
    if (analysisDropdownRef.current && analysisDropdownRef.current.contains(target)) return;
    if (sampleDropdownRef.current && sampleDropdownRef.current.contains(target)) return;
    if (advancedDropdownRef.current && advancedDropdownRef.current.contains(target)) return;
    
    if (pinned) return;
    // If a modal inside the panel is open, do not close the panel/backdrop
    if (showSampleSizeModal) return;
    
    // Close dropdowns first, then panel
    if (showAnalysisDropdown || showAdvancedDropdown || showSampleSizeDropdown) {
      closeAllDropdowns();
      return;
    }
    onClose();
    closeAllDropdowns();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't interfere with dropdown triggers
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown-trigger]')) {
      return; // Let the dropdown trigger handle the click
    }
    // Do not allow container clicks to collapse dropdowns; only backdrop or explicit selection should close
    e.stopPropagation();
    if (pinned) return;
    if (showSampleSizeModal) return;
  };

  const handleDropdownTriggerHover = (e: React.MouseEvent<HTMLDivElement>, isEnter: boolean) => {
    if (isEnter) {
      e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorNeutralBackground1Hover} 0%, ${tokens.colorNeutralBackground2} 100%)`;
      e.currentTarget.style.boxShadow = `0 2px 6px rgba(0,0,0,0.15)`;
      e.currentTarget.style.transform = 'translateY(-1px)';
    } else {
      e.currentTarget.style.background = `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`;
      e.currentTarget.style.boxShadow = `0 1px 3px rgba(0,0,0,0.1)`;
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  const handleOptionHover = (e: React.MouseEvent<HTMLDivElement>, isEnter: boolean) => {
    e.currentTarget.style.background = isEnter 
      ? tokens.colorNeutralBackground1Hover 
      : tokens.colorNeutralBackground1;
  };

  return (
    <>
      {/* Professional scrollbar for dropdown lists */}
      <style>{`
        .dropdown-content::-webkit-scrollbar { width: 8px; }
        .dropdown-content::-webkit-scrollbar-track { background: ${tokens.colorNeutralStroke2}; border-radius: 4px; }
        .dropdown-content::-webkit-scrollbar-thumb { background: ${tokens.colorNeutralStroke1}; border-radius: 4px; border: 1px solid ${tokens.colorNeutralStroke2}; }
        .dropdown-content::-webkit-scrollbar-thumb:hover { background: ${tokens.colorNeutralForeground3}; }
      `}</style>
      {/* Backdrop to close the slider when clicking outside */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 998,
          pointerEvents: pinned ? 'none' : 'auto',
          display: (showAnalysisDropdown || showAdvancedDropdown || showSampleSizeDropdown) ? 'none' : 'block'
        }} 
        onClick={handleBackdropClick}
        onMouseDown={(e) => {
          if (!pinned && e.target === e.currentTarget) {
            e.stopPropagation();
          }
        }}
      />
      <div
        style={styles.container}
        onClick={handleContainerClick}
        ref={(node) => {
          panelRef.current = node;
          containerRef.current = node;
        }}
      >
        {/* Pin control */}
        <div style={{ position: 'absolute', right: 12, bottom: 8, zIndex: 1002, cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); setPinned(!pinned); }}
             title={pinned ? 'Unpin panel' : 'Pin panel'}>
          {pinned ? <MdPushPin size={14} /> : <MdOutlinePushPin size={14} />}
        </div>
        {/* Tabs removed - show all sections in one panel */}
        
        <div style={styles.content}>
          {/* Box 1: Analysis + Sample Size */}
          <div style={styles.card}>
            <div style={{ ...styles.cardInner, gridTemplateColumns: '1fr 1fr' }}>
                {/* Analysis Dropdown */}
                <div style={styles.fieldContainer}>
                  <label style={{
                    ...styles.label,
                    color: tokens.colorBrandForeground1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    paddingBottom: 2,
                    borderBottom: `2px solid ${tokens.colorBrandForeground1}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>Analysis</label>
                  <div style={{ position: 'relative', width: '100%', zIndex: 1000003 }}>
                    <div
                      data-dropdown-trigger
                      style={{ ...styles.dropdownTrigger, width: 220, position: 'relative', zIndex: 1000003 }}
                      ref={analysisTriggerRef as any}
                      onMouseEnter={(e) => handleDropdownTriggerHover(e, true)}
                      onMouseLeave={(e) => handleDropdownTriggerHover(e, false)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        
                        if (showAnalysisDropdown) {
                          // If already open, close it
                          setAnalysisSearchTerm('');
                          setShowAnalysisDropdown(false);
                          setAnalysisMenuStyle({});
                          return;
                        }
                        
                        // Close other dropdowns first
                        if (showAdvancedDropdown) {
                          setShowAdvancedDropdown(false);
                          setAdvancedSearchTerm('');
                          setAdvancedMenuStyle({});
                        }
                        if (showSampleSizeDropdown) {
                          setShowSampleSizeDropdown(false);
                          setSampleSizeSearchTerm('');
                          setSampleMenuStyle({});
                        }
                        
                        // Set flag to prevent immediate closure
                        isOpeningDropdownRef.current = true;
                        
                        // Compute and set style immediately
                        if (analysisTriggerRef.current) {
                          const menuStyle = computeFixedMenu(analysisTriggerRef.current);
                          setAnalysisMenuStyle(menuStyle);
                        }
                        
                        // Then open dropdown
                        setShowAnalysisDropdown(true);
                        
                        // Reset flag after a delay to allow dropdown to render
                        setTimeout(() => {
                          isOpeningDropdownRef.current = false;
                        }, 300);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                      }}
                    >
                      <span>
                        {selectedAnalysis 
                          ? getDisplayText(selectedAnalysis, analysisOptions) 
                          : 'Select Analysis'}
                      </span>
                      <MdArrowDropDown size={20} style={{ color: tokens.colorNeutralForeground1 }} />
                    </div>
                    
                    {/* Dropdown options - rendered via portal */}
                    {showAnalysisDropdown && typeof document !== 'undefined' && createPortal(
                      <div 
                        ref={analysisDropdownRef}
                        className="dropdown-content" 
                        style={{ 
                          ...styles.dropdownContent, 
                          ...(Object.keys(analysisMenuStyle).length > 0 ? analysisMenuStyle : {
                            position: 'fixed',
                            top: analysisTriggerRef.current ? `${analysisTriggerRef.current.getBoundingClientRect().bottom + 2}px` : '0px',
                            left: analysisTriggerRef.current ? `${analysisTriggerRef.current.getBoundingClientRect().left}px` : '0px',
                            width: analysisTriggerRef.current ? `${analysisTriggerRef.current.getBoundingClientRect().width}px` : '220px',
                            zIndex: 1000002,
                          }), 
                          maxHeight: '240px', 
                          overflowY: 'auto' 
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {/* Search input */}
                        <div 
                          style={styles.searchContainer}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            placeholder="Search analysis tests..."
                            value={analysisSearchTerm}
                            onChange={(e) => setAnalysisSearchTerm(e.target.value)}
                            style={styles.searchInput}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                            }}
                            onFocus={(e) => {
                              e.stopPropagation();
                            }}
                            data-search-input="true"
                          />
                        </div>
                        {filteredAnalysisOptions.map((option) => (
                          <div
                            key={option.value}
                            data-opening-modal="true"
                            style={styles.option}
                            onMouseEnter={(e) => handleOptionHover(e, true)}
                            onMouseLeave={(e) => handleOptionHover(e, false)}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                              if (option.execute) {
                                console.log('Opening modal with execute:', option.execute);
                                // Set flag to prevent backdrop/document from closing panel
                                isOpeningModalRef.current = true;
                                // Close dropdowns first
                                closeAllDropdowns();
                                setAnalysisSearchTerm('');
                                // Open modal immediately
                                setMenuItem(option.execute);
                                // Close panel after modal opens (only if not pinned)
                                if (!pinned) {
                                  setTimeout(() => {
                                    isOpeningModalRef.current = false;
                                    onClose();
                                  }, 300);
                                } else {
                                  isOpeningModalRef.current = false;
                                }
                              }
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
                
                {/* Sample Size Dropdown */}
                <div style={styles.fieldContainer}>
                  <label style={{
                    ...styles.label,
                    color: tokens.colorPaletteBlueForeground2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    paddingBottom: 2,
                    borderBottom: `2px solid ${tokens.colorPaletteBlueForeground2}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>Sample Size</label>
                  <div style={{ position: 'relative', width: '100%', zIndex: 1000003 }}>
                    <div
                      data-dropdown-trigger
                      style={{ ...styles.dropdownTrigger, position: 'relative', zIndex: 1000003 }}
                      ref={sampleTriggerRef as any}
                      onMouseEnter={(e) => handleDropdownTriggerHover(e, true)}
                      onMouseLeave={(e) => handleDropdownTriggerHover(e, false)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        
                        // Use the openDropdown function to ensure consistent behavior
                        openDropdown('sampleSize');
                        
                        // Compute and set style immediately
                        if (sampleTriggerRef.current) {
                          const menuStyle = computeFixedMenu(sampleTriggerRef.current);
                          setSampleMenuStyle(menuStyle);
                        }
                        
                        // Set flag to prevent immediate closure
                        isOpeningDropdownRef.current = true;
                        
                        // Reset flag after a delay to allow dropdown to render
                        setTimeout(() => {
                          isOpeningDropdownRef.current = false;
                        }, 300);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                      }}
                    >
                      <span>
                        {selectedSampleSize 
                          ? sampleSizeOptions.find(opt => opt.value === selectedSampleSize)?.label 
                          : 'Select Sample Size Test'}
                      </span>
                      <MdArrowDropDown size={20} style={{ color: tokens.colorNeutralForeground1 }} />
                    </div>
                    
                    {/* Sample Size Dropdown options - rendered via portal */}
                    {showSampleSizeDropdown && typeof document !== 'undefined' && createPortal(
                      <div 
                        ref={sampleDropdownRef}
                        className="dropdown-content" 
                        style={{
                          ...styles.dropdownContent,
                          ...(Object.keys(sampleMenuStyle).length > 0 ? sampleMenuStyle : {
                            position: 'fixed',
                            top: sampleTriggerRef.current ? `${sampleTriggerRef.current.getBoundingClientRect().bottom + 2}px` : '0px',
                            left: sampleTriggerRef.current ? `${sampleTriggerRef.current.getBoundingClientRect().left}px` : '0px',
                            width: sampleTriggerRef.current ? `${sampleTriggerRef.current.getBoundingClientRect().width}px` : '220px',
                            zIndex: 1000002,
                          }),
                          maxHeight: '240px',
                          overflowY: 'auto',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {/* Search input */}
                        <div 
                          style={styles.searchContainer}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            placeholder="Search sample size tests..."
                            value={sampleSizeSearchTerm}
                            onChange={(e) => setSampleSizeSearchTerm(e.target.value)}
                            style={styles.searchInput}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                            }}
                            onFocus={(e) => {
                              e.stopPropagation();
                            }}
                            data-search-input="true"
                          />
                        </div>
                        {filteredSampleSizeOptions.map((option) => (
                          <div
                            key={option.value}
                            data-opening-modal="true"
                            style={styles.option}
                            onMouseEnter={(e) => handleOptionHover(e, true)}
                            onMouseLeave={(e) => handleOptionHover(e, false)}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                              // Set flag to prevent backdrop/document from closing panel
                              isOpeningModalRef.current = true;
                              // Close dropdowns first
                              closeAllDropdowns();
                              setSampleSizeSearchTerm('');
                              // Open modal at BaseComponent level (persists independently)
                              if (openSampleSizeModal) {
                                openSampleSizeModal(option.value);
                              } else {
                                // Fallback to local state if function not provided
                                handleSampleSizeChange(option.value);
                              }
                              // Close panel after modal opens (only if not pinned)
                              if (!pinned) {
                                setTimeout(() => {
                                  isOpeningModalRef.current = false;
                                  onClose();
                                }, 200);
                              } else {
                                // Reset flag if pinned
                                setTimeout(() => {
                                  isOpeningModalRef.current = false;
                                }, 200);
                              }
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
            </div>
          </div>

          {/* Box 2: Advanced */}
          <div style={styles.card}>
            <div style={{ ...styles.cardInner, gridTemplateColumns: '1fr' }}>
                {/* Advanced Analysis Dropdown */}
                <div style={styles.fieldContainer}>
                  <label style={{
                    ...styles.label,
                    color: tokens.colorPalettePurpleForeground2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    paddingBottom: 2,
                    borderBottom: `2px solid ${tokens.colorPalettePurpleForeground2}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>Advanced Analysis</label>
                  <div style={{ position: 'relative', width: '100%', zIndex: 1000003 }}>
                    <div
                      data-dropdown-trigger
                      style={{ ...styles.dropdownTrigger, position: 'relative', zIndex: 1000003 }}
                      ref={advancedTriggerRef as any}
                      onMouseEnter={(e) => handleDropdownTriggerHover(e, true)}
                      onMouseLeave={(e) => handleDropdownTriggerHover(e, false)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        
                        if (showAdvancedDropdown) {
                          // If already open, close it
                          setAdvancedSearchTerm('');
                          setShowAdvancedDropdown(false);
                          setAdvancedMenuStyle({});
                          return;
                        }
                        
                        // Close other dropdowns first
                        if (showAnalysisDropdown) {
                          setShowAnalysisDropdown(false);
                          setAnalysisSearchTerm('');
                          setAnalysisMenuStyle({});
                        }
                        if (showSampleSizeDropdown) {
                          setShowSampleSizeDropdown(false);
                          setSampleSizeSearchTerm('');
                          setSampleMenuStyle({});
                        }
                        
                        // Set flag to prevent immediate closure
                        isOpeningDropdownRef.current = true;
                        
                        // Compute and set style immediately
                        if (advancedTriggerRef.current) {
                          const menuStyle = computeFixedMenu(advancedTriggerRef.current);
                          setAdvancedMenuStyle(menuStyle);
                        }
                        
                        // Then open dropdown
                        setShowAdvancedDropdown(true);
                        
                        // Reset flag after a delay to allow dropdown to render
                        setTimeout(() => {
                          isOpeningDropdownRef.current = false;
                        }, 300);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                      }}
                    >
                      <span>
                        {selectedAdvanced 
                          ? getDisplayText(selectedAdvanced, advancedOptions) 
                          : 'Select Advanced Analysis'}
                      </span>
                      <MdArrowDropDown size={20} style={{ color: tokens.colorNeutralForeground1 }} />
                    </div>
                    
                    {/* Advanced Dropdown options - rendered via portal */}
                    {showAdvancedDropdown && typeof document !== 'undefined' && createPortal(
                      <div 
                        ref={advancedDropdownRef}
                        className="dropdown-content" 
                        style={{ 
                          ...styles.dropdownContent, 
                          ...(Object.keys(advancedMenuStyle).length > 0 ? advancedMenuStyle : {
                            position: 'fixed',
                            top: advancedTriggerRef.current ? `${advancedTriggerRef.current.getBoundingClientRect().bottom + 2}px` : '0px',
                            left: advancedTriggerRef.current ? `${advancedTriggerRef.current.getBoundingClientRect().left}px` : '0px',
                            width: advancedTriggerRef.current ? `${advancedTriggerRef.current.getBoundingClientRect().width}px` : '220px',
                            zIndex: 1000002,
                          }), 
                          maxHeight: '240px', 
                          overflowY: 'auto' 
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {/* Search input */}
                        <div 
                          style={styles.searchContainer}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            placeholder="Search advanced analysis..."
                            value={advancedSearchTerm}
                            onChange={(e) => setAdvancedSearchTerm(e.target.value)}
                            style={styles.searchInput}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                            }}
                            onFocus={(e) => {
                              e.stopPropagation();
                            }}
                            data-search-input="true"
                          />
                        </div>
                        {filteredAdvancedOptions.map((option) => (
                          <div
                            key={option.value}
                            data-opening-modal="true"
                            style={styles.option}
                            onMouseEnter={(e) => handleOptionHover(e, true)}
                            onMouseLeave={(e) => handleOptionHover(e, false)}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                              if (option.execute) {
                                console.log('Opening modal with execute:', option.execute);
                                // Set flag to prevent backdrop/document from closing panel
                                isOpeningModalRef.current = true;
                                // Close dropdowns first
                                closeAllDropdowns();
                                setAdvancedSearchTerm('');
                                // Open modal immediately
                                setMenuItem(option.execute);
                                // Close panel after modal opens (only if not pinned)
                                if (!pinned) {
                                  setTimeout(() => {
                                    isOpeningModalRef.current = false;
                                    onClose();
                                  }, 300);
                                } else {
                                  isOpeningModalRef.current = false;
                                }
                              }
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 