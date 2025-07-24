import { useState } from 'react';
import type { TestsTab, TestOption } from './types';
import { analysisOptions, advancedOptions } from './constants';
import { sampleSizeOptions } from '../sample-size';

export const useTests = (setMenuItem: (item: string) => void, onClose: () => void) => {
  const [tab, setTab] = useState<TestsTab>('analysis');
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [selectedAdvanced, setSelectedAdvanced] = useState('');
  const [showAnalysisDropdown, setShowAnalysisDropdown] = useState(false);
  const [showAdvancedDropdown, setShowAdvancedDropdown] = useState(false);
  const [showSampleSizeDropdown, setShowSampleSizeDropdown] = useState(false);
  const [selectedSampleSize, setSelectedSampleSize] = useState('');
  const [showSampleSizeModal, setShowSampleSizeModal] = useState(false);
  const [analysisSearchTerm, setAnalysisSearchTerm] = useState('');
  const [sampleSizeSearchTerm, setSampleSizeSearchTerm] = useState('');
  const [advancedSearchTerm, setAdvancedSearchTerm] = useState('');

  // Professional dropdown management: ensure only one dropdown is open at a time
  const openDropdown = (dropdownType: 'analysis' | 'advanced' | 'sampleSize') => {
    // Close all other dropdowns first
    if (dropdownType !== 'analysis') setShowAnalysisDropdown(false);
    if (dropdownType !== 'advanced') setShowAdvancedDropdown(false);
    if (dropdownType !== 'sampleSize') setShowSampleSizeDropdown(false);
    
    // Clear search terms for closed dropdowns
    if (dropdownType !== 'analysis') setAnalysisSearchTerm('');
    if (dropdownType !== 'advanced') setAdvancedSearchTerm('');
    if (dropdownType !== 'sampleSize') setSampleSizeSearchTerm('');
    
    // Toggle the target dropdown
    switch (dropdownType) {
      case 'analysis':
        setShowAnalysisDropdown(!showAnalysisDropdown);
        break;
      case 'advanced':
        setShowAdvancedDropdown(!showAdvancedDropdown);
        break;
      case 'sampleSize':
        setShowSampleSizeDropdown(!showSampleSizeDropdown);
        break;
    }
  };

  const handleAnalysisChange = (value: string) => {
    setSelectedAnalysis(value);
    
    // Find the selected analysis option and execute it
    const findAndExecute = (options: TestOption[]): string | null => {
      for (const option of options) {
        if (option.value === value && option.execute) {
          return option.execute;
        }
        if (option.children) {
          const result = findAndExecute(option.children);
          if (result) return result;
        }
      }
      return null;
    };

    const executeFunction = findAndExecute(analysisOptions);
    if (executeFunction) {
      setMenuItem(executeFunction);
      onClose(); // Close the slider after selection
    }
  };

  const handleAdvancedChange = (value: string) => {
    setSelectedAdvanced(value);
    
    // Find the selected advanced option and execute it
    const findAndExecute = (options: TestOption[]): string | null => {
      for (const option of options) {
        if (option.value === value && option.execute) {
          return option.execute;
        }
        if (option.children) {
          const result = findAndExecute(option.children);
          if (result) return result;
        }
      }
      return null;
    };

    const executeFunction = findAndExecute(advancedOptions);
    if (executeFunction) {
      setMenuItem(executeFunction);
      onClose(); // Close the slider after selection
    }
  };

  const handleSampleSizeChange = (value: string) => {
    setSelectedSampleSize(value);
    setShowSampleSizeModal(true);
    setShowSampleSizeDropdown(false);
  };

  // Flatten the nested structure for display
  const getDisplayText = (value: string, options: TestOption[]): string => {
    const findDisplayText = (optionList: TestOption[]): string => {
      for (const option of optionList) {
        if (option.value === value) {
          return option.label;
        }
        if (option.children) {
          const result = findDisplayText(option.children);
          if (result) return result;
        }
      }
      return '';
    };
    return findDisplayText(options);
  };

  // Get all executable options (flattened)
  const getExecutableOptions = (options: TestOption[]): Array<{ label: string; value: string; execute: string }> => {
    const result: Array<{ label: string; value: string; execute: string }> = [];
    
    const flattenOptions = (optionList: TestOption[], prefix = '') => {
      optionList.forEach(option => {
        if (option.execute) {
          result.push({
            label: prefix + option.label,
            value: option.value,
            execute: option.execute
          });
        } else if (option.children) {
          flattenOptions(option.children, prefix + option.label + ' > ');
        }
      });
    };
    
    flattenOptions(options);
    return result;
  };

  const executableAnalysisOptions = getExecutableOptions(analysisOptions);
  const executableAdvancedOptions = getExecutableOptions(advancedOptions);

  // Filter analysis options based on search term
  const filteredAnalysisOptions = executableAnalysisOptions.filter(option =>
    option.label.toLowerCase().includes(analysisSearchTerm.toLowerCase())
  );

  // Filter sample size options based on search term
  const filteredSampleSizeOptions = sampleSizeOptions.filter(option =>
    option.label.toLowerCase().includes(sampleSizeSearchTerm.toLowerCase())
  );

  // Filter advanced options based on search term
  const filteredAdvancedOptions = executableAdvancedOptions.filter(option =>
    option.label.toLowerCase().includes(advancedSearchTerm.toLowerCase())
  );

  const closeAllDropdowns = () => {
    setShowAnalysisDropdown(false);
    setShowAdvancedDropdown(false);
    setShowSampleSizeDropdown(false);
    setAnalysisSearchTerm('');
    setSampleSizeSearchTerm('');
    setAdvancedSearchTerm('');
  };

  const closeSampleSizeModal = () => {
    setShowSampleSizeModal(false);
    setSelectedSampleSize('');
  };

  return {
    // State
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
    
    // Computed values
    filteredAnalysisOptions,
    filteredSampleSizeOptions,
    filteredAdvancedOptions,
    
    // Actions
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
  };
}; 