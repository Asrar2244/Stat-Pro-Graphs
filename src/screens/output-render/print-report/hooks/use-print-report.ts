import { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { OutputRenderContext } from '@context';
import type { IPrintSection, IDatabaseConnectionInfo } from '@outputPrintReport/types';
import { 
  getAllDatabaseData, 
  generateCompleteDataFromDatabase, 
  extractSectionContent,
  getAllStylesheets 
} from '@outputPrintReport/utils';
import { generatePrintReportHTML, type IPrintReportTemplateData } from '@outputPrintReport/utils/template';
import { useStartProStore } from '@store/main-store';

export const usePrintReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('outputToolBar');
  const setBlockUI = useStartProStore((state) => state.setBlockUI);
  const toolsElRef = useRef<HTMLElement | null>(null);
  const titleContainerRef = useRef<HTMLElement | null>(null);
  const subtitleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!toolsElRef.current) {
      toolsElRef.current = document.querySelector('.output-tools') as HTMLElement | null;
    }

    const toolsEl = toolsElRef.current;
    const container = toolsEl?.previousElementSibling as HTMLElement | null;
    titleContainerRef.current = container ?? null;

    const subtitle = container?.querySelector('small') as HTMLElement | null;
    subtitleRef.current = subtitle ?? null;
  }, [context?.selectedRun]);

  const generateReport = async (selectedSections: IPrintSection[]) => {
    if (selectedSections.length === 0) {
      setBlockUI({
        value: true,
        msg: t('noSectionsSelected'),
        hideOk: false,
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get database connection info
      const connectionInfo: IDatabaseConnectionInfo = {
        tabName: context?.selectedRun?.tabName || '',
        outputTableName: context?.selectedRun?.result?.output_table_name,
      };

      // Validate connection info
      // If no tab name available, will use DOM fallback

      // 🚀 Get ALL database data upfront to ensure complete data access
      const allDatabaseData = await getAllDatabaseData(connectionInfo);

      // 🚀 Create a hidden iframe for printing (works better in desktop apps)
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.style.opacity = '0';
      printFrame.style.pointerEvents = 'none';
      document.body.appendChild(printFrame);
      
      const printWindow = printFrame.contentWindow;
      if (!printWindow) {
        document.body.removeChild(printFrame);
        setBlockUI({
          value: true,
          msg: t('printError'),
          hideOk: false,
        });
        return;
      }

      // Read toolbar title exactly as shown (left side of toolbar)
      const computeToolbarTitle = (): string | null => {
        try {
          const titleContainer = titleContainerRef.current;
          if (!titleContainer) return null;
          const mainTitle = (titleContainer.childNodes[0]?.textContent || '').trim();
          const sub = (subtitleRef.current?.textContent || '').trim();
          if (mainTitle && sub) return `${mainTitle} ${sub}`; // matches "X @: Y"
          if (mainTitle) return mainTitle;
          return null;
        } catch {
          return null;
        }
      };
      const toolbarTitle = computeToolbarTitle();

      // 🚀 Get all existing stylesheets
      const allStyles = getAllStylesheets();

      // 🚀 Process selected sections with COMPLETE DATABASE DATA
      const sections: Array<{ title: string; content: string }> = [];
      
      for (let i = 0; i < selectedSections.length; i++) {
        const section = selectedSections[i];
        
        try {
          // 🎯 PRIORITY 1: Try to get complete data from database
          let sectionContent = '';
          
          if (allDatabaseData.size > 0) {
            // Attempt database extraction
            const dbContent = await generateCompleteDataFromDatabase(allDatabaseData, section.title, connectionInfo);
            sectionContent = dbContent || '';
          }
          
          // 🎯 FALLBACK: Use DOM extraction if database didn't work
          if (!sectionContent) {
            // Fallback to DOM extraction
            const extractedContent = await extractSectionContent(section.element, section.title);
            sectionContent = extractedContent || '';
          }
          
          sections.push({
            title: section.title,
            content: sectionContent || '',
          });
          
        } catch (error) {
          sections.push({
            title: section.title,
            content: '<p style="color: red; font-style: italic;">⚠️ Error loading complete data for this section.</p>',
          });
        }
      }

      // 🚀 Generate HTML using template function
      const now = new Date();
      const templateData: IPrintReportTemplateData = {
        title: context?.selectedRun?.outputFor || 'Statistical Analysis',
        toolbarTitle,
        tabName: context?.selectedRun?.tabName,
        outputFor: context?.selectedRun?.outputFor,
        generatedDate: now.toLocaleDateString(),
        generatedTime: now.toLocaleTimeString(),
        allStyles,
        sections,
      };

      const htmlContent = generatePrintReportHTML(templateData);

             // Write content to the new window
       printWindow.document.write(htmlContent);
       printWindow.document.close();

      // Robust one-shot wait/print with timeout to avoid loops on subsequent runs
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const waitAndPrint = async () => {
        try {
          // wait and then print
          const start = Date.now();
          const maxWaitMs = 15000; // 15s cap
          const checkIntervalMs = 800;

          await delay(1200); // initial grace

          while (Date.now() - start < maxWaitMs) {
            const printDoc = printWindow.document;
            if (!printDoc) break;
            const svgs = printDoc.querySelectorAll('svg');
            const canvases = printDoc.querySelectorAll('canvas');
            let ready = true;
            if (svgs.length + canvases.length > 0) {
              ready = Array.from(svgs).some((s) => (s as SVGElement).innerHTML.length > 200);
            }
            if (ready) break;
            await delay(checkIntervalMs);
          }

          printWindow.focus();
          printWindow.print();
          // Clean up iframe after printing
          setTimeout(() => {
            try {
              if (printFrame.parentNode) {
                document.body.removeChild(printFrame);
              }
            } catch {}
          }, 1000);
        } catch (e) {
          // Fallback: printing without additional wait due to error
          try { 
            printWindow.print(); 
          } catch {}
          // Clean up iframe
          try {
            if (printFrame.parentNode) {
              document.body.removeChild(printFrame);
            }
          } catch {}
        }
      };

      void waitAndPrint();

    } catch (error) {
      setBlockUI({
        value: true,
        msg: t('printError'),
        hideOk: false,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Enable Ctrl/Cmd+P to trigger the same Print Report flow
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isPrintShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p';
      if (!isPrintShortcut) return;
      e.preventDefault();
      // Open the modal via a custom event so user can select sections
      const evt = new Event('open-print-modal');
      document.dispatchEvent(evt);
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true } as any);
  // Intentionally run once
  }, []);

  return {
    generateReport,
    isGenerating,
  };
};

// Install a lightweight custom context menu to support "Right‑click → Print Report"
// Styled to match the app's Fluent-like look. Hold Shift while right‑clicking to use the system menu.
(() => {
  let menuEl: HTMLDivElement | null = null;
  let contextStyleEl: HTMLStyleElement | null = null;
  let focusIndex = 0;
  const hideMenu = () => {
    if (menuEl) {
      menuEl.style.display = 'none';
    }
  };
  const ensureInViewport = (x: number, y: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = 220;
    const height = 110;
    const nx = Math.min(Math.max(8, x), vw - width - 8);
    const ny = Math.min(Math.max(8, y), vh - height - 8);
    return { nx, ny };
  };
  const createItem = (label: string, onClick: () => void, bold = false, shortcut?: string) => {
    const item = document.createElement('div');
    item.className = 'sp-context-item';
    item.role = 'menuitem';
    item.tabIndex = -1;
    const text = document.createElement('span');
    text.textContent = label;
    if (bold) text.style.fontWeight = '600';
    const sc = document.createElement('span');
    sc.className = 'sp-context-shortcut';
    sc.textContent = shortcut || '';
    item.appendChild(text);
    item.appendChild(sc);
    item.addEventListener('click', () => {
      hideMenu();
      onClick();
    });
    return item;
  };

  const showMenu = (x: number, y: number) => {
    if (!menuEl) {
      menuEl = document.createElement('div');
      menuEl.className = 'sp-context-menu';
      menuEl.role = 'menu';

      // Title
      const title = document.createElement('div');
      title.className = 'sp-context-title';
      title.textContent = 'Actions';
      menuEl.appendChild(title);

      // Items
      const printItem = createItem('Print Report…', () => document.dispatchEvent(new Event('open-print-modal')), true, 'Ctrl/Cmd+P');
      const sysItem = createItem('System Print…', () => window.print?.());
      const divider = document.createElement('div');
      divider.className = 'sp-context-divider';
      const cancelItem = createItem('Cancel', hideMenu);

      [printItem, sysItem, divider, cancelItem].forEach((n) => menuEl!.appendChild(n));

      // Inject CSS once in a <style> tag if not present - use cached reference
      if (!contextStyleEl) {
        contextStyleEl = document.getElementById('sp-context-style') as HTMLStyleElement | null;
        if (!contextStyleEl) {
          const style = document.createElement('style');
          style.id = 'sp-context-style';
          style.textContent = `.sp-context-menu{position:fixed;z-index:99999;background:#fff;border:1px solid #e3e3e3;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.16);min-width:220px;font:14px system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#1a1a1a;overflow:hidden}.sp-context-title{padding:8px 12px;font-weight:600;font-size:12px;opacity:.7}.sp-context-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;color:#1a1a1a}.sp-context-item:hover{background:#f4f4f4}.sp-context-shortcut{font-size:12px;color:#6b7280;margin-left:16px}.sp-context-divider{height:1px;background:#e3e3e3;margin:4px 0}`;
          document.head.appendChild(style);
          contextStyleEl = style;
        }
      }
      document.body.appendChild(menuEl);
      document.addEventListener('click', hideMenu);
      window.addEventListener('blur', hideMenu);
      window.addEventListener('resize', hideMenu);
      window.addEventListener('scroll', hideMenu, true);
      // keyboard nav
      document.addEventListener('keydown', (ev) => {
        if (menuEl!.style.display !== 'block') return;
        const items = Array.from(menuEl!.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
        if (ev.key === 'Escape') hideMenu();
        if (ev.key === 'ArrowDown') { focusIndex = (focusIndex + 1) % items.length; items[focusIndex].focus(); ev.preventDefault(); }
        if (ev.key === 'ArrowUp') { focusIndex = (focusIndex - 1 + items.length) % items.length; items[focusIndex].focus(); ev.preventDefault(); }
        if (ev.key === 'Enter') { items[focusIndex].click(); }
      });
    }
    const { nx, ny } = ensureInViewport(x, y);
    menuEl.style.left = `${nx}px`;
    menuEl.style.top = `${ny}px`;
    menuEl.style.display = 'block';
    // focus first item for accessibility
    const items = Array.from(menuEl.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    focusIndex = 0;
    items[0]?.focus();
  };
  const onContextMenu = (e: MouseEvent) => {
    // Allow system menu with Shift+Right‑click
    if (e.shiftKey) return;
    // Only intercept inside the app root to avoid external contexts
    const target = e.target as HTMLElement | null;
    if (!target) return;
    // Limit strictly to visible Output screen
    const root = target.closest('[data-output-root="true"]') as HTMLElement | null;
    if (!root) return;
    const outputArea = target.closest('.output-area');
    if (!outputArea || !root.contains(outputArea)) return;
    const cs = window.getComputedStyle(root);
    const rect = root.getBoundingClientRect();
    const rootVisible = rect.width > 0 && rect.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
    if (!rootVisible) return;
    e.preventDefault();
    showMenu(e.clientX, e.clientY);
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('contextmenu', onContextMenu);
  }
})();