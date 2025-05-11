import { useState } from 'react';
export interface IUseContextMenu {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  anchorPoint: { x: number; y: number };
  setAnchorPoint: (value: { x: number; y: number }) => void;
  clickedHeader: string | null;
  setClickedHeader: (value: string | null) => void;
  type: 'row' | 'column' | null;
  setType: (value: 'row' | 'column' | null) => void;
}

export const useContextMenu = (): IUseContextMenu => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [clickedHeader, setClickedHeader] = useState<string | null>(null);
  const [type, setType] = useState<'row' | 'column' | null>(null);

  return {
    menuOpen,
    setMenuOpen,
    anchorPoint,
    setAnchorPoint,
    clickedHeader,
    setClickedHeader,
    type,
    setType,
  };
};
