import { useState } from 'react';
import type { GraphsTab, GraphOption } from './types';
import { graph2DOptions, graph3DOptions, graphAdvancedOptions } from './constants';

export const useGraphs = (setMenuItem: (item: string) => void, onClose: () => void) => {
  const [tab, setTab] = useState<GraphsTab>('2d');
  const [selected2D, setSelected2D] = useState('');
  const [selected3D, setSelected3D] = useState('');
  const [selectedAdvanced, setSelectedAdvanced] = useState('');
  
  // Dropdown states
  const [show2DDropdown, setShow2DDropdown] = useState(false);
  const [show3DDropdown, setShow3DDropdown] = useState(false);
  const [showAdvancedDropdown, setShowAdvancedDropdown] = useState(false);
  
  // Search terms
  const [graph2DSearchTerm, setGraph2DSearchTerm] = useState('');
  const [graph3DSearchTerm, setGraph3DSearchTerm] = useState('');
  const [graphAdvancedSearchTerm, setGraphAdvancedSearchTerm] = useState('');

  // Filter options based on search
  const filterOptions = (options: GraphOption[], searchTerm: string): GraphOption[] => {
    if (!searchTerm) return options;
    
    return options.map(category => ({
      ...category,
      children: category.children?.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    })).filter(category => (category.children?.length || 0) > 0);
  };

  const filtered2DOptions = filterOptions(graph2DOptions, graph2DSearchTerm);
  const filtered3DOptions = filterOptions(graph3DOptions, graph3DSearchTerm);
  const filteredAdvancedOptions = filterOptions(graphAdvancedOptions, graphAdvancedSearchTerm);

  // Professional dropdown management: ensure only one dropdown is open at a time
  const openDropdown = (dropdownType: '2d' | '3d' | 'advanced') => {
    // Close all other dropdowns first
    if (dropdownType !== '2d') setShow2DDropdown(false);
    if (dropdownType !== '3d') setShow3DDropdown(false);
    if (dropdownType !== 'advanced') setShowAdvancedDropdown(false);
    
    // Clear search terms for closed dropdowns
    if (dropdownType !== '2d') setGraph2DSearchTerm('');
    if (dropdownType !== '3d') setGraph3DSearchTerm('');
    if (dropdownType !== 'advanced') setGraphAdvancedSearchTerm('');
    
    // Toggle the target dropdown
    switch (dropdownType) {
      case '2d':
        setShow2DDropdown(!show2DDropdown);
        break;
      case '3d':
        setShow3DDropdown(!show3DDropdown);
        break;
      case 'advanced':
        setShowAdvancedDropdown(!showAdvancedDropdown);
        break;
    }
  };

  const handle2DChange = (value: string) => {
    setSelected2D(value);
    
    // Find the selected graph option and execute it
    const findAndExecute = (options: GraphOption[]): string | null => {
      for (const option of options) {
        if (option.children) {
          for (const child of option.children) {
            if (child.value === value && child.execute) {
              return child.execute;
            }
          }
        }
      }
      return null;
    };

    const executeFunction = findAndExecute(graph2DOptions);
    if (executeFunction) {
      setMenuItem(executeFunction);
      onClose(); // Close the slider after selection
    }
  };

  const handle3DChange = (value: string) => {
    setSelected3D(value);
    
    const findAndExecute = (options: GraphOption[]): string | null => {
      for (const option of options) {
        if (option.children) {
          for (const child of option.children) {
            if (child.value === value && child.execute) {
              return child.execute;
            }
          }
        }
      }
      return null;
    };

    const executeFunction = findAndExecute(graph3DOptions);
    if (executeFunction) {
      setMenuItem(executeFunction);
      onClose();
    }
  };

  const handleAdvancedChange = (value: string) => {
    setSelectedAdvanced(value);
    
    const findAndExecute = (options: GraphOption[]): string | null => {
      for (const option of options) {
        if (option.children) {
          for (const child of option.children) {
            if (child.value === value && child.execute) {
              return child.execute;
            }
          }
        }
      }
      return null;
    };

    const executeFunction = findAndExecute(graphAdvancedOptions);
    if (executeFunction) {
      setMenuItem(executeFunction);
      onClose();
    }
  };

  const getDisplayText = (tab: GraphsTab, value: string): string => {
    const options = tab === '2d' ? graph2DOptions : tab === '3d' ? graph3DOptions : graphAdvancedOptions;
    
    for (const category of options) {
      if (category.children) {
        const found = category.children.find(item => item.value === value);
        if (found) return found.label;
      }
    }
    return 'Select a graph type';
  };

  const closeAllDropdowns = () => {
    setShow2DDropdown(false);
    setShow3DDropdown(false);
    setShowAdvancedDropdown(false);
    setGraph2DSearchTerm('');
    setGraph3DSearchTerm('');
    setGraphAdvancedSearchTerm('');
  };

  return {
    tab,
    selected2D,
    selected3D,
    selectedAdvanced,
    show2DDropdown,
    show3DDropdown,
    showAdvancedDropdown,
    graph2DSearchTerm,
    graph3DSearchTerm,
    graphAdvancedSearchTerm,
    filtered2DOptions,
    filtered3DOptions,
    filteredAdvancedOptions,
    setTab,
    setShow2DDropdown,
    setShow3DDropdown,
    setShowAdvancedDropdown,
    setGraph2DSearchTerm,
    setGraph3DSearchTerm,
    setGraphAdvancedSearchTerm,
    handle2DChange,
    handle3DChange,
    handleAdvancedChange,
    getDisplayText,
    closeAllDropdowns,
    openDropdown,
  };
};





