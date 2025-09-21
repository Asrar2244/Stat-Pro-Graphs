import React from 'react';

export interface GraphsDropdownPanelProps {
  open: boolean;
  onClose: () => void;
  setMenuItem: (item: string) => void;
}

export type GraphsTab = '2d' | '3d' | 'advanced';

export interface GraphOption {
  label: string;
  value?: string;
  execute?: string;
  icon?: React.ComponentType<{ size?: number }>;
  children?: GraphOption[];
}