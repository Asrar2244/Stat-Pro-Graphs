export interface TestOption {
  label: string;
  value: string;
  execute?: string;
  children?: TestOption[];
}

export interface TestsDropdownPanelProps {
  open: boolean;
  onClose: () => void;
  setMenuItem: (item: string) => void;
  pinned?: boolean;
  setPinned?: (pinned: boolean) => void;
  openSampleSizeModal?: (test: string) => void;
}

export type TestsTab = 'analysis' | 'advance'; 