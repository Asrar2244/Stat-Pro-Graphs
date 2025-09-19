import React, { FC, useEffect, useRef, useState } from 'react';
import { tokens } from '@fluentui/react-components';
import { MdArrowDropDown } from 'react-icons/md';
import { MdOutlinePushPin, MdPushPin } from 'react-icons/md';
import { SampleSizeModalWrapper, sampleSizeOptions } from '../sample-size';
import { useTests } from './use-tests';
import { useTestsStyles } from './styles-hook/use-tests-styles';
import { analysisOptions, advancedOptions } from './constants';
import type { TestsDropdownPanelProps } from './types';

export const TestsDropdownPanel: FC<TestsDropdownPanelProps> = ({ open, onClose, setMenuItem }) => {
  const styles = useTestsStyles();
  const [pinned, setPinned] = useState(false);
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
    // setShowSampleSizeDropdown, // not used after layout merge
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
  const analysisTriggerRef = useRef<HTMLDivElement | null>(null);
  const sampleTriggerRef = useRef<HTMLDivElement | null>(null);
  const advancedTriggerRef = useRef<HTMLDivElement | null>(null);

  // Fixed-position dropdown coordinates
  const [analysisMenuStyle, setAnalysisMenuStyle] = useState<React.CSSProperties>({});
  const [sampleMenuStyle, setSampleMenuStyle] = useState<React.CSSProperties>({});
  const [advancedMenuStyle, setAdvancedMenuStyle] = useState<React.CSSProperties>({});

  const computeFixedMenu = (trigger: HTMLElement | null): React.CSSProperties => {
    if (!trigger) return {};
    const r = trigger.getBoundingClientRect();
    return {
      position: 'fixed',
      top: `${r.bottom}px`,
      left: `${r.left}px`,
      width: `${r.width}px`,
      minWidth: `${r.width}px`,
      right: 'auto',
      zIndex: 1000001,
    };
  };

  useEffect(() => {
    if (showAnalysisDropdown) {
      setAnalysisMenuStyle(computeFixedMenu(analysisTriggerRef.current));
    }
  }, [showAnalysisDropdown]);

  useEffect(() => {
    if (showSampleSizeDropdown) {
      setSampleMenuStyle(computeFixedMenu(sampleTriggerRef.current));
    }
  }, [showSampleSizeDropdown]);

  useEffect(() => {
    if (showAdvancedDropdown) {
      setAdvancedMenuStyle(computeFixedMenu(advancedTriggerRef.current));
    }
  }, [showAdvancedDropdown]);

  const handleBackdropClick = () => {
    if (pinned) return;
    // If a modal inside the panel is open, do not close the panel/backdrop
    if (showSampleSizeModal) return;
    onClose();
    closeAllDropdowns();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
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
      <div style={{ ...styles.backdrop, pointerEvents: pinned ? 'none' : 'auto' }} onClick={handleBackdropClick} />
      
      <div
        style={styles.container}
        onClick={handleContainerClick}
        ref={panelRef}
      >
        {/* Pin control */}
        <div style={{ position: 'absolute', left: 12, top: 8, zIndex: 1002, cursor: 'pointer' }}
             onClick={(e) => { e.stopPropagation(); setPinned((v) => !v); }}
             title={pinned ? 'Unpin panel' : 'Pin panel'}>
          {pinned ? <MdPushPin size={18} /> : <MdOutlinePushPin size={18} />}
        </div>
        {/* Tabs removed - show all sections in one panel */}
        
        <div style={styles.content}>
          {/* Bottom line */}
          <div style={styles.bottomLine} />
          
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
                    paddingBottom: 4,
                    borderBottom: `2px solid ${tokens.colorBrandForeground1}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>Analysis</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <div
                      data-dropdown-trigger
                      style={{ ...styles.dropdownTrigger, width: 220 }}
                      ref={analysisTriggerRef as any}
                      onMouseEnter={(e) => handleDropdownTriggerHover(e, true)}
                      onMouseLeave={(e) => handleDropdownTriggerHover(e, false)}
                      onClick={() => {
                        if (showAnalysisDropdown) {
                          setAnalysisSearchTerm('');
                        }
                        setAnalysisMenuStyle(computeFixedMenu(analysisTriggerRef.current));
                        openDropdown('analysis');
                      }}
                    >
                      <span>
                        {selectedAnalysis 
                          ? getDisplayText(selectedAnalysis, analysisOptions) 
                          : 'Select Analysis'}
                      </span>
                      <MdArrowDropDown size={20} style={{ color: tokens.colorNeutralForeground1 }} />
                    </div>
                    
                    {/* Dropdown options */}
                    {showAnalysisDropdown && (
                      <div className="dropdown-content" style={{ ...styles.dropdownContent, ...analysisMenuStyle, maxHeight: '240px', overflowY: 'auto' }}>
                        {/* Search input */}
                        <div style={styles.searchContainer}>
                          <input
                            type="text"
                            placeholder="Search analysis tests..."
                            value={analysisSearchTerm}
                            onChange={(e) => setAnalysisSearchTerm(e.target.value)}
                            style={styles.searchInput}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {filteredAnalysisOptions.map((option) => (
                          <div
                            key={option.value}
                            style={styles.option}
                            onMouseEnter={(e) => handleOptionHover(e, true)}
                            onMouseLeave={(e) => handleOptionHover(e, false)}
                            onClick={() => {
                              handleAnalysisChange(option.value);
                              // close explicitly
                              closeAllDropdowns();
                              setAnalysisSearchTerm('');
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
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
                    paddingBottom: 4,
                    borderBottom: `2px solid ${tokens.colorPaletteBlueForeground2}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>Sample Size</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <div
                      data-dropdown-trigger
                      style={styles.dropdownTrigger}
                      ref={sampleTriggerRef as any}
                      onMouseEnter={(e) => handleDropdownTriggerHover(e, true)}
                      onMouseLeave={(e) => handleDropdownTriggerHover(e, false)}
                      onClick={() => {
                        if (showSampleSizeDropdown) {
                          setSampleSizeSearchTerm('');
                        }
                        setSampleMenuStyle(computeFixedMenu(sampleTriggerRef.current));
                        openDropdown('sampleSize');
                      }}
                    >
                      <span>
                        {selectedSampleSize 
                          ? sampleSizeOptions.find(opt => opt.value === selectedSampleSize)?.label 
                          : 'Select Sample Size Test'}
                      </span>
                      <MdArrowDropDown size={20} style={{ color: tokens.colorNeutralForeground1 }} />
                    </div>
                    
                    {/* Sample Size Dropdown options */}
                    {showSampleSizeDropdown && (
                      <div className="dropdown-content" style={{
                        ...styles.dropdownContent,
                        ...sampleMenuStyle,
                        zIndex: 1000002,
                        maxHeight: '240px',
                        overflowY: 'auto',
                      }}>
                        {/* Search input */}
                        <div style={styles.searchContainer}>
                          <input
                            type="text"
                            placeholder="Search sample size tests..."
                            value={sampleSizeSearchTerm}
                            onChange={(e) => setSampleSizeSearchTerm(e.target.value)}
                            style={styles.searchInput}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {filteredSampleSizeOptions.map((option) => (
                          <div
                            key={option.value}
                            style={styles.option}
                            onMouseEnter={(e) => handleOptionHover(e, true)}
                            onMouseLeave={(e) => handleOptionHover(e, false)}
                            onClick={() => {
                              handleSampleSizeChange(option.value);
                              closeAllDropdowns();
                              setSampleSizeSearchTerm('');
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
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
                    paddingBottom: 4,
                    borderBottom: `2px solid ${tokens.colorPalettePurpleForeground2}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>Advanced Analysis</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <div
                      data-dropdown-trigger
                      style={styles.dropdownTrigger}
                      ref={advancedTriggerRef as any}
                      onMouseEnter={(e) => handleDropdownTriggerHover(e, true)}
                      onMouseLeave={(e) => handleDropdownTriggerHover(e, false)}
                      onClick={() => {
                        if (showAdvancedDropdown) {
                          setAdvancedSearchTerm('');
                        }
                        setAdvancedMenuStyle(computeFixedMenu(advancedTriggerRef.current));
                        openDropdown('advanced');
                      }}
                    >
                      <span>
                        {selectedAdvanced 
                          ? getDisplayText(selectedAdvanced, advancedOptions) 
                          : 'Select Advanced Analysis'}
                      </span>
                      <MdArrowDropDown size={20} style={{ color: tokens.colorNeutralForeground1 }} />
                    </div>
                    
                    {/* Advanced Dropdown options */}
                    {showAdvancedDropdown && (
                      <div className="dropdown-content" style={{ ...styles.dropdownContent, ...advancedMenuStyle, maxHeight: '240px', overflowY: 'auto' }}>
                        {/* Search input */}
                        <div style={styles.searchContainer}>
                          <input
                            type="text"
                            placeholder="Search advanced analysis..."
                            value={advancedSearchTerm}
                            onChange={(e) => setAdvancedSearchTerm(e.target.value)}
                            style={styles.searchInput}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {filteredAdvancedOptions.map((option) => (
                          <div
                            key={option.value}
                            style={styles.option}
                            onMouseEnter={(e) => handleOptionHover(e, true)}
                            onMouseLeave={(e) => handleOptionHover(e, false)}
                            onClick={() => {
                              handleAdvancedChange(option.value);
                              closeAllDropdowns();
                              setAdvancedSearchTerm('');
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sample Size Modal */}
      {showSampleSizeModal && (
        <SampleSizeModalWrapper 
          open={showSampleSizeModal}
          selectedTest={selectedSampleSize}
          onClose={closeSampleSizeModal}
        />
      )}
    </>
  );
}; 