export interface HelpDropdownPanelProps {
  open: boolean;
  onClose: () => void;
  setMenuItem: (item: string) => void;
  pinned?: boolean;
  setPinned?: (pinned: boolean) => void;
}

