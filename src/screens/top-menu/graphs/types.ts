export interface GraphOption {
  label: string;
  value: string;
  icon?: any;
  execute?: string;
  children?: GraphOption[];
}

export interface GraphsDropdownPanelProps {
  open: boolean;
  onClose: () => void;
  setMenuItem: (item: string) => void;
}

export type GraphsTab = '2d' | '3d' | 'advanced';



