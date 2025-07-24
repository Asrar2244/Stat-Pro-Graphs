import React, { FC } from 'react';
import { TabList, Tab, tokens } from '@fluentui/react-components';
import { MdArrowDropDown } from 'react-icons/md';
import { SampleSizeModalWrapper, sampleSizeOptions } from '../sample-size';
import { useTests } from './use-tests';
import { useTestsStyles } from './styles-hook/use-tests-styles';
import { analysisOptions, advancedOptions } from './constants';
import type { TestsDropdownPanelProps } from './types';

export const TestsDropdownPanel: FC<TestsDropdownPanelProps> = ({ open, onClose, setMenuItem }) => {
  const styles = useTestsStyles();
  const {
    tab,
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
    setTab,
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
  } = useTests(setMenuItem, onClose);

  if (!open) return null;

  const handleBackdropClick = () => {
    onClose();
    closeAllDropdowns();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only close dropdowns if clicking on the main container but not on dropdown triggers or content
    const target = e.target as HTMLElement;
    const isDropdownTrigger = target.closest('[data-dropdown-trigger]');
    const isDropdownContent = target.closest('.dropdown-content');
    
    if (!isDropdownTrigger && !isDropdownContent) {
      setShowAnalysisDropdown(false);
      setShowAdvancedDropdown(false);
      setShowSampleSizeDropdown(false);
    }
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
      {/* Backdrop to close the slider when clicking outside */}
      <div style={styles.backdrop} onClick={handleBackdropClick} />
      
      <div
        style={{
          ...styles.container,
          transform: open ? 'translateY(0)' : 'translateY(-100%)',
        }}
        onClick={handleContainerClick}
      >
        <div style={styles.tabContainer}>
          <TabList
            selectedValue={tab}
            appearance="subtle"
            style={styles.tabList}
            onTabSelect={(_, data) => setTab(data.value as 'analysis' | 'advance')}
          >
            <Tab value="analysis" style={styles.tab(tab === 'analysis')}>
              Analysis
            </Tab>
            <Tab value="advance" style={styles.tab(tab === 'advance')}>
              Advance
            </Tab>
          </TabList>
        </div>
        
        <div style={styles.content}>
          {/* Bottom line */}
          <div style={styles.bottomLine} />
          
          {tab === 'analysis' ? (
            <div style={styles.card}>
              <div style={styles.cardInner}>
                {/* Analysis Dropdown */}
                <div style={styles.fieldContainer}>
                  <label style={styles.label}>Analysis</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <div
                      data-dropdown-trigger
                      style={styles.dropdownTrigger}
                      onMouseEnter={(e) => handleDropdownTriggerHover(e, true)}
                      onMouseLeave={(e) => handleDropdownTriggerHover(e, false)}
                      onClick={() => {
                        if (showAnalysisDropdown) {
                          setAnalysisSearchTerm('');
                        }
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
                      <div className="dropdown-content" style={styles.dropdownContent}>
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
                              setShowAnalysisDropdown(false);
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
                  <label style={styles.label}>Sample Size</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <div
                      data-dropdown-trigger
                      style={styles.dropdownTrigger}
                      onMouseEnter={(e) => handleDropdownTriggerHover(e, true)}
                      onMouseLeave={(e) => handleDropdownTriggerHover(e, false)}
                      onClick={() => {
                        if (showSampleSizeDropdown) {
                          setSampleSizeSearchTerm('');
                        }
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
                        zIndex: 1002,
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
          ) : (
            <div style={styles.card}>
              <div style={styles.cardInner}>
                {/* Advanced Analysis Dropdown */}
                <div style={styles.fieldContainer}>
                  <label style={styles.label}>Advanced Analysis</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <div
                      data-dropdown-trigger
                      style={styles.dropdownTrigger}
                      onMouseEnter={(e) => handleDropdownTriggerHover(e, true)}
                      onMouseLeave={(e) => handleDropdownTriggerHover(e, false)}
                      onClick={() => {
                        if (showAdvancedDropdown) {
                          setAdvancedSearchTerm('');
                        }
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
                      <div className="dropdown-content" style={styles.dropdownContent}>
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
                              setShowAdvancedDropdown(false);
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
          )}
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