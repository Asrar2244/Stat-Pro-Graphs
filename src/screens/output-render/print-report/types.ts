import React from 'react';

export interface IPrintReportModalProps {
  open: boolean;
  closeModal: () => void;
}

export interface IPrintSection {
  id: string;
  title: string;
  element: HTMLElement;
  selected: boolean;
}

export interface IDatabaseTable {
  name: string;
  data: any[];
}

export interface ISectionMatchResult {
  tableName: string;
  data: any[];
  score: number;
}

export interface IPrintReportHookResult {
  sections: IPrintSection[];
  setSections: React.Dispatch<React.SetStateAction<IPrintSection[]>>;
  allSelected: boolean;
  setAllSelected: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSelectAll: () => void;
  generateReport: () => Promise<void>;
  isGenerating: boolean;
}

export interface IDatabaseConnectionInfo {
  tabName: string;
  outputTableName?: string;
}

export interface IPrintStyles {
  allStyles: string;
  printSpecificStyles: string;
}

export interface IContentExtractionOptions {
  includeInteractiveElements?: boolean;
  expandScrollableContent?: boolean;
  preserveOriginalStyling?: boolean;
}