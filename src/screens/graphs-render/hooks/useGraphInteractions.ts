/**
 * Custom hook for graph interactive features
 * Handles inline editing, context menu, and event handling
 */

import { useEffect, useRef, useCallback } from 'react';
import { getTitleText } from '../utils/common';

export interface UseGraphInteractionsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  liveProps?: any;
  graphConfig?: any;
  subType?: string;
  liveTitle?: string;
}

export interface UseGraphInteractionsReturn {
  applyInlineEditing: () => void;
  setupContextMenu: () => void;
}

export const useGraphInteractions = ({
  containerRef,
  liveProps,
  graphConfig,
  subType,
  liveTitle
}: UseGraphInteractionsProps): UseGraphInteractionsReturn => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  const dispatchUpdate = useCallback((key: 'graphName' | 'axisXData' | 'axisYData', value: string) => {
    // Find React context updater if exposed via window or custom event
    // As a minimal approach, modify liveProps directly is not possible; edits will re-render via parent state changes.
    const event = new CustomEvent('statpro:updateGraphProperty', { detail: { key, value } });
    window.dispatchEvent(event);
  }, []);

  const applyInlineEditing = useCallback(() => {
    const root = containerRef.current as HTMLElement | null;
    if (!root) return;

    // Title double-click
    const titleEl = root.querySelector('g.gtitle') as SVGGElement | null;
    if (titleEl) {
      titleEl.addEventListener('dblclick', () => {
        const next = prompt('Edit graph title', liveTitle || getTitleText(subType || '') || '') || '';
        if (next) dispatchUpdate('graphName', next);
      });
    }
    
    // Axis titles
    const xTitleEl = root.querySelector('g.xg .xtitle') as SVGGElement | null;
    if (xTitleEl) {
      xTitleEl.addEventListener('dblclick', () => {
        const current = (liveProps?.global?.axisXData) || 'X axis';
        const next = prompt('Edit X axis title', current) || '';
        if (next) dispatchUpdate('axisXData', next);
      });
    }
    
    const yTitleEl = root.querySelector('g.yg .ytitle') as SVGGElement | null;
    if (yTitleEl) {
      yTitleEl.addEventListener('dblclick', () => {
        const current = (liveProps?.global?.axisYData) || 'Y axis';
        const next = prompt('Edit Y axis title', current) || '';
        if (next) dispatchUpdate('axisYData', next);
      });
    }
  }, [containerRef, liveProps, subType, liveTitle, dispatchUpdate]);

  const setupContextMenu = useCallback(() => {
    const root = containerRef.current as HTMLElement | null;
    if (!root) return;

    const disposeMenu = () => {
      if (menuRef.current && menuRef.current.parentElement) {
        menuRef.current.parentElement.removeChild(menuRef.current);
      }
      menuRef.current = null;
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };

    const onDocClick = () => disposeMenu();
    const onKeyDown = (ev: KeyboardEvent) => { 
      if (ev.key === 'Escape') disposeMenu(); 
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      
      // Block any other contextmenu listeners from auto-opening properties
      if (typeof (e as any).stopImmediatePropagation === 'function') {
        (e as any).stopImmediatePropagation();
      }
      
      disposeMenu();
      menuRef.current = document.createElement('div');
      menuRef.current.style.position = 'fixed';
      menuRef.current.style.left = `${e.clientX}px`;
      menuRef.current.style.top = `${e.clientY}px`;
      menuRef.current.style.zIndex = '9999';
      
      // Theme-aware styling based on actual app background luminance
      const getPageBg = (): string => {
        try {
          const root = document.documentElement;
          const csRoot = window.getComputedStyle(root);
          const rootBg = csRoot.getPropertyValue('background-color');
          if (rootBg && rootBg !== 'rgba(0, 0, 0, 0)' && rootBg !== 'transparent') return rootBg.trim();
          const csBody = window.getComputedStyle(document.body);
          const bodyBg = csBody.getPropertyValue('background-color');
          if (bodyBg) return bodyBg.trim();
        } catch {}
        return '#ffffff';
      };

      const parseRgb = (c: string): { r: number; g: number; b: number } => {
        if (c.startsWith('#')) {
          const h = c.replace('#','');
          const r = parseInt(h.substring(0,2),16);
          const g = parseInt(h.substring(2,4),16);
          const b = parseInt(h.substring(4,6),16);
          return { r,g,b };
        }
        const parts = c.replace(/rgba?\(|\)|\s/g,'').split(',');
        return { r: parseInt(parts[0]||'255',10), g: parseInt(parts[1]||'255',10), b: parseInt(parts[2]||'255',10) };
      };

      const bgCol = getPageBg();
      const { r:pr, g:pg, b:pb } = parseRgb(bgCol);
      const lum = (0.2126*pr + 0.7152*pg + 0.0722*pb) / 255;
      const isDark = lum < 0.5;
      const bgColor = isDark ? '#1f1f1f' : '#ffffff';
      const textColor = isDark ? '#f3f3f3' : '#111111';
      
      menuRef.current.style.background = bgColor;
      menuRef.current.style.color = textColor;
      menuRef.current.style.border = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)';
      menuRef.current.style.boxShadow = isDark ? '0 6px 16px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.12)';
      menuRef.current.style.borderRadius = '6px';
      menuRef.current.style.minWidth = '180px';
      menuRef.current.style.padding = '4px';
      
      const item = document.createElement('div');
      item.textContent = 'Graph Properties';
      item.style.padding = '8px 12px';
      item.style.cursor = 'pointer';
      item.style.background = 'transparent';
      item.style.color = textColor;
      
      item.addEventListener('mouseenter', () => { 
        item.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'; 
      });
      item.addEventListener('mouseleave', () => { 
        item.style.background = 'transparent'; 
      });
      item.addEventListener('click', () => {
        const ev = new CustomEvent('statpro:openGraphProperties');
        window.dispatchEvent(ev);
        disposeMenu();
      });
      
      menuRef.current.appendChild(item);
      document.body.appendChild(menuRef.current);
      
      setTimeout(() => {
        document.addEventListener('click', onDocClick, true);
        document.addEventListener('keydown', onKeyDown, true);
      }, 0);
    };

    // Remove any inline handler and add our handler in capture phase to override others
    (root as any).oncontextmenu = null;
    root.addEventListener('contextmenu', onContextMenu, true);

    // Cleanup function
    return () => {
      disposeMenu();
      root.removeEventListener('contextmenu', onContextMenu, true);
    };
  }, [containerRef]);

  // Setup interactions after initial render
  useEffect(() => {
    const cleanupContextMenu = setupContextMenu();
    applyInlineEditing();

    return () => {
      if (cleanupContextMenu) {
        cleanupContextMenu();
      }
    };
  }, [applyInlineEditing, setupContextMenu]);

  return {
    applyInlineEditing,
    setupContextMenu
  };
};
