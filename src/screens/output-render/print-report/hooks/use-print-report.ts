import { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { OutputRenderContext } from '../../context';
import type { IPrintSection, IDatabaseConnectionInfo } from '../types';
import { 
  getAllDatabaseData, 
  generateCompleteDataFromDatabase, 
  extractSectionContent,
  getAllStylesheets 
} from '../utils';

export const usePrintReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const context = useContext(OutputRenderContext);
  const { t } = useTranslation('outputToolBar');

  const generateReport = async (selectedSections: IPrintSection[]) => {
    if (selectedSections.length === 0) {
      alert(t('noSectionsSelected') || 'Please select at least one section to print.');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🎯 PrintReport: Generating for', selectedSections.length, 'sections');

      // Get database connection info
      const connectionInfo: IDatabaseConnectionInfo = {
        tabName: context?.selectedRun?.tabName || '',
        outputTableName: context?.selectedRun?.result?.output_table_name,
      };

      // Validate connection info
      if (!connectionInfo.tabName) {
        console.warn('⚠️ No tab name available, will use DOM fallback');
      }

      // 🚀 Get ALL database data upfront to ensure complete data access
      const allDatabaseData = await getAllDatabaseData(connectionInfo);

      // 🚀 Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow popups to use the print feature');
        return;
      }

      // Read toolbar title exactly as shown (left side of toolbar)
      const computeToolbarTitle = (): string | null => {
        try {
          const toolsEl = document.querySelector('.output-tools');
          const titleContainer = toolsEl?.previousElementSibling as HTMLElement | null;
          if (!titleContainer) return null;
          const mainTitle = (titleContainer.childNodes[0]?.textContent || '').trim();
          const small = titleContainer.querySelector('small');
          const sub = (small?.textContent || '').trim();
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

      // 🚀 Start building the HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${context?.selectedRun?.outputFor || 'Statistical Analysis'} - Report</title>
            <style>
              /* Original application styles */
              ${allStyles}
              
                             /* Additional print-specific styles */
               body {
                 background: white !important;
                 color: black !important;
                 margin: 20px;
                 font-family: inherit;
                 /* A4 page optimization */
                 max-width: 210mm;
                 min-height: 297mm;
               }
              
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                page-break-after: avoid;
              }
              
              .print-title {
                font-size: 24pt;
                font-weight: bold;
                color: black !important;
                margin-bottom: 10px;
              }
              
              .print-date {
                font-size: 12pt;
                color: #666;
                margin-bottom: 20px;
              }
              .print-subtitle {
                font-size: 13pt;
                color: #333;
                margin-top: -6px;
                margin-bottom: 4px;
                font-weight: 500;
              }
              
                             .print-section {
                 margin-bottom: 32px;
                 padding: 10px 0;
                 border: none;
                 border-radius: 0;
                 background: transparent;
                 page-break-inside: avoid;
                 overflow: visible;
                 clear: both;
                 /* A4 page optimization */
                 max-width: 190mm;
                 box-sizing: border-box;
               }
              
              .print-section-title {
                font-size: 18pt;
                font-weight: 700;
                color: #111 !important;
                margin: 0 0 14px 0;
                padding-bottom: 6px;
                border-bottom: 1px solid #999;
                page-break-after: avoid;
              }
              /* KV auto table styling (hook styles mirror) */
              .kv-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
              .kv-th { border: 1px solid #999; background: #f3f3f3; padding: 6px; text-align: left; }
              .kv-td { border: 1px solid #999; padding: 6px; vertical-align: top; word-break: break-word; white-space: normal; }
              
              .print-section-content {
                position: relative;
                overflow: visible;
                background: transparent;
                padding: 0;
                border: none;
                border-radius: 0;
              }
              
              /* Ensure all content is visible and properly styled for print */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              /* EXPAND ALL SCROLLABLE CONTENT FOR PRINTING */
              .print-section-content * {
                max-height: none !important;
                overflow: visible !important;
                overflow-x: visible !important;
                overflow-y: visible !important;
                box-shadow: none !important;
                outline: none !important;
              }
              /* Remove Card/Preview decorative borders completely */
              .print-section-content .fui-Card,
              .print-section-content .fui-CardPreview,
              .print-section-content [class*="Card"],
              .print-section-content [class*="Preview"] {
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
              }
              .print-section-content .fui-Card::before,
              .print-section-content .fui-Card::after,
              .print-section-content .fui-CardPreview::before,
              .print-section-content .fui-CardPreview::after {
                content: none !important;
                display: none !important;
              }
              
              /* Ensure tables show all rows and columns align consistently */
              .print-section-content table {
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                width: 100% !important;
                table-layout: fixed !important;
                border-collapse: collapse !important;
                border-spacing: 0 !important;
                border: none !important; /* remove outer box entirely */
              }
              
              /* Make sure table bodies show all content */
              .print-section-content tbody, 
              .print-section-content thead, 
              .print-section-content tfoot {
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                display: table-row-group !important;
              }
              
              /* Handle very wide tables */
              .print-section-content table {
                word-wrap: break-word;
                word-break: break-word;
                font-size: 10pt !important;
              }
              
              .print-section-content th,
              .print-section-content td {
                box-sizing: border-box;
                padding: 6px !important;
                overflow-wrap: anywhere;
                word-break: break-word;
                white-space: normal;
                border: 1px solid #999 !important; /* clearer grid lines for print */
                font-variant-numeric: tabular-nums;
                line-height: 1.2;
              }
              .print-section-content th { text-align: left !important; background: #f7f7f7; }
              .print-section-content td.numeric { text-align: right !important; }

              /* Slightly tighter typography for very wide tables generated with class 'wide-table' */
              .print-section-content table.wide-table {
                font-size: 8.5pt !important;
              }
              .print-section-content table.wide-table th,
              .print-section-content table.wide-table td {
                padding: 4px !important;
              }
              
                                                                                                                       /* ENHANCED CHART/SVG STYLING FOR PRINT WITH COMPLETE WIDTH but AUTO HEIGHT to fit content */
                 .print-section-content svg {
                   width: 100% !important;
                   height: auto !important;
                   max-width: 170mm !important;
                   min-width: 100% !important;
                   max-height: none !important;
                   min-height: 150px !important;
                   display: block !important;
                   margin: 15px 0 !important;
                   background: white !important;
                   border: none !important;
                   padding: 15px !important;
                   page-break-inside: avoid !important;
                   left: 0 !important;
                   right: 0 !important;
                   transform: none !important;
                 }
              
                                                                                                                       .print-section-content canvas {
                   width: 100% !important;
                   height: auto !important;
                   max-width: 170mm !important;
                   min-width: 100% !important;
                   max-height: none !important;
                   display: block !important;
                   margin: 15px 0 !important;
                   border: none !important;
                   page-break-inside: avoid !important;
                   left: 0 !important;
                   right: 0 !important;
                   transform: none !important;
                 }
              
                                                                                                                       /* Plotly specific styling with COMPLETE WIDTH but CONTROLLED HEIGHT */
                 .print-section-content .js-plotly-plot,
                 .print-section-content [class*="plotly"],
                 .print-section-content [data-unformatted-plot] {
                   width: 100% !important;
                   max-width: 170mm !important;
                   min-width: 100% !important;
                   height: 450px !important;
                   min-height: 360px !important;
                   max-height: 520px !important;
                   overflow: visible !important;
                   display: block !important;
                   margin: 20px 0 !important;
                   background: white !important;
                   border: none !important;
                   padding: 15px !important;
                   page-break-inside: avoid !important;
                   left: 0 !important;
                   right: 0 !important;
                   transform: none !important;
                 }
              
              /* Chart containers within cards */
              .print-section-content .fui-CardPreview {
                overflow: visible !important;
                height: auto !important;
                max-height: none !important;
              }
              
                                                                                                                       /* Enhanced chart styling for print with COMPLETE WIDTH but CONTROLLED HEIGHT */
                 .print-section-content [class*="chart"],
                 .print-section-content [class*="graph"],
                 .print-section-content [class*="visualization"] {
                   width: 100% !important;
                   max-width: 170mm !important;
                   min-width: 100% !important;
                   height: 450px !important;
                   min-height: 360px !important;
                   max-height: 520px !important;
                   overflow: visible !important;
                   display: block !important;
                   background: white !important;
                   border: none !important;
                   margin: 15px 0 !important;
                   padding: 15px !important;
                   page-break-inside: avoid !important;
                   left: 0 !important;
                   right: 0 !important;
                   transform: none !important;
                 }
              
                                                                                                                       /* Ensure chart images are properly sized with COMPLETE WIDTH but CONTROLLED HEIGHT */
                 .print-section-content img[src*="data:image"] {
                   width: 100% !important;
                   max-width: 170mm !important;
                   min-width: 100% !important;
                   height: 350px !important;
                   min-height: 300px !important;
                   max-height: 450px !important;
                   display: block !important;
                   margin: 15px 0 !important;
                   border: none !important;
                   page-break-inside: avoid !important;
                   left: 0 !important;
                   right: 0 !important;
                   transform: none !important;
                 }
                 
                 /* Ensure SVG elements are properly sized with COMPLETE WIDTH but CONTROLLED HEIGHT */
                 .print-section-content svg {
                   width: 100% !important;
                   max-width: 170mm !important;
                   min-width: 100% !important;
                   height: 350px !important;
                   min-height: 300px !important;
                   max-height: 450px !important;
                   display: block !important;
                   margin: 15px 0 !important;
                   border: none !important;
                   page-break-inside: avoid !important;
                   left: 0 !important;
                   right: 0 !important;
                   transform: none !important;
                 }
              
                             /* Hide interactive elements and toolbars */
               button, 
               [role="button"],
               [class*="Button"],
               [class*="Menu"],
               [class*="menu"],
               [class*="fui-CardFooter"],
               .modebar,
               .plotly-modebar,
               [class*="toolbar"],
               [class*="tools"] {
                 display: none !important;
               }
               
               /* CRITICAL: Force empty chart containers to be compact */
               .print-section-content [class*="plotly"]:empty,
               .print-section-content [class*="chart"]:empty,
               .print-section-content [class*="graph"]:empty,
               .print-section-content [class*="visualization"]:empty {
                 height: 120px !important;
                 min-height: 120px !important;
                 max-height: 120px !important;
                 background: #f8f9fa !important;
                 border: 1px solid #dee2e6 !important;
                 border-radius: 4px !important;
                 display: flex !important;
                 align-items: center !important;
                 justify-content: center !important;
                 color: #6c757d !important;
                 font-size: 14px !important;
                 font-style: italic !important;
                 text-align: center !important;
                 padding: 20px !important;
                 margin: 10px 0 !important;
               }
               
               /* Force empty SVG containers to be compact */
               .print-section-content svg:empty,
               .print-section-content svg:not(:has(*)) {
                 height: 120px !important;
                 min-height: 120px !important;
                 max-height: 120px !important;
                 background: #f8f9fa !important;
                 border: 1px solid #dee2e6 !important;
                 border-radius: 4px !important;
               }
              
                             @page {
                 margin: 0.5in;
                 size: A4;
               }
              
              @media print {
                .print-section { page-break-inside: avoid; }
                .print-section-title { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <div class="print-title">${context?.selectedRun?.outputFor || 'Statistical Analysis'} - Report</div>
              ${toolbarTitle ? `<div class=\"print-subtitle\">${toolbarTitle}</div>` : (context?.selectedRun?.tabName ? `<div class=\"print-subtitle\">${context?.selectedRun?.outputFor || ''}: ${context?.selectedRun?.tabName}</div>` : '')}
              <div class="print-date">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            </div>
      `;

      // 🚀 Process selected sections with COMPLETE DATABASE DATA
      for (let i = 0; i < selectedSections.length; i++) {
        const section = selectedSections[i];
        console.log(`📊 Section ${i + 1}/${selectedSections.length}: ${section.title}`);
        
        htmlContent += `
          <div class="print-section">
            <div class="print-section-title">${section.title}</div>
            <div class="print-section-content">
        `;

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
          
          htmlContent += sectionContent;
          // processed
          
        } catch (error) {
          console.error(`❌ Error processing section "${section.title}":`, error);
          htmlContent += `<p style="color: red; font-style: italic;">⚠️ Error loading complete data for this section.</p>`;
        }

        htmlContent += `
            </div>
          </div>
        `;
      }
      
      console.log(`🎉 Prepared ${selectedSections.length} sections`);

      htmlContent += `
          </body>
        </html>
      `;

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
            if (printWindow.closed) break;
            const printDoc = printWindow.document;
            const svgs = printDoc.querySelectorAll('svg');
            const canvases = printDoc.querySelectorAll('canvas');
            let ready = true;
            if (svgs.length + canvases.length > 0) {
              ready = Array.from(svgs).some((s) => (s as SVGElement).innerHTML.length > 200);
            }
            if (ready) break;
            await delay(checkIntervalMs);
          }

          console.log('🖨️ Printing...');
          printWindow.focus();
          printWindow.print();
          setTimeout(() => { try { printWindow.close(); } catch {} }, 500);
        } catch (e) {
          console.warn('⚠️ Fallback: printing without additional wait due to error', e);
          try { printWindow.print(); } catch {}
          try { printWindow.close(); } catch {}
        }
      };

      void waitAndPrint();

    } catch (error) {
      console.error('❌ Fatal error generating report:', error);
      alert('Error generating report. Please check the console for details.');
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

      // Inject CSS once in a <style> tag if not present
      if (!document.getElementById('sp-context-style')) {
        const style = document.createElement('style');
        style.id = 'sp-context-style';
        style.textContent = `.sp-context-menu{position:fixed;z-index:99999;background:#fff;border:1px solid #e3e3e3;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.16);min-width:220px;font:14px system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#1a1a1a;overflow:hidden}.sp-context-title{padding:8px 12px;font-weight:600;font-size:12px;opacity:.7}.sp-context-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;color:#1a1a1a}.sp-context-item:hover{background:#f4f4f4}.sp-context-shortcut{font-size:12px;color:#6b7280;margin-left:16px}.sp-context-divider{height:1px;background:#e3e3e3;margin:4px 0}`;
        document.head.appendChild(style);
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