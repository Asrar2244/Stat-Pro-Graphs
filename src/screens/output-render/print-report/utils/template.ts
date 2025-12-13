/**
 * Print Report Template Utilities
 * Separates HTML template generation from business logic
 */

export interface IPrintReportTemplateData {
  title: string;
  toolbarTitle?: string | null;
  tabName?: string;
  outputFor?: string;
  generatedDate: string;
  generatedTime: string;
  allStyles: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

/**
 * Print-specific CSS styles
 */
export const PRINT_STYLES = `
  /* Additional print-specific styles */
  body {
    background: white !important;
    color: black !important;
    margin: 0;
    padding: 20px;
    font-family: inherit;
    /* A4 page optimization */
    max-width: 210mm;
    min-height: auto;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 20px;
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
    margin-bottom: 20px;
    padding: 0;
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
  
  .print-section:last-child {
    margin-bottom: 0;
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
    body {
      margin: 0;
      padding: 0;
    }
    .print-section { page-break-inside: avoid; }
    .print-section-title { page-break-after: avoid; }
    /* Prevent extra blank page */
    html, body {
      height: auto !important;
      min-height: auto !important;
    }
  }
`;

/**
 * Escapes HTML special characters to prevent XSS
 */
const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Renders a section HTML template
 */
const renderSection = (section: { title: string; content: string }): string => {
  const escapedTitle = escapeHtml(section.title);
  return `
    <div class="print-section">
      <div class="print-section-title">${escapedTitle}</div>
      <div class="print-section-content">
        ${section.content}
      </div>
    </div>
  `;
};

/**
 * Renders the print header HTML
 */
const renderHeader = (data: IPrintReportTemplateData): string => {
  const subtitle = data.toolbarTitle 
    ? `<div class="print-subtitle">${escapeHtml(data.toolbarTitle)}</div>`
    : (data.tabName 
      ? `<div class="print-subtitle">${escapeHtml(data.outputFor || '')}: ${escapeHtml(data.tabName)}</div>`
      : '');

  return `
    <div class="print-header">
      <div class="print-title">${escapeHtml(data.title)} - Report</div>
      ${subtitle}
      <div class="print-date">Generated on: ${escapeHtml(data.generatedDate)} ${escapeHtml(data.generatedTime)}</div>
    </div>
  `;
};

/**
 * Main template function that generates the complete HTML document
 * Similar to Handlebars/Mustache syntax pattern but using vanilla JS
 */
export const generatePrintReportHTML = (data: IPrintReportTemplateData): string => {
  const sectionsHTML = data.sections.map(renderSection).join('\n');

  return `<!DOCTYPE html>
<html>
  <head>
    <title>${escapeHtml(data.title)} - Report</title>
    <meta charset="UTF-8">
    <style>
      /* Original application styles */
      ${data.allStyles}
      
      ${PRINT_STYLES}
    </style>
  </head>
  <body>
    ${renderHeader(data)}
    ${sectionsHTML}
    <script>
      // Prevent extra blank page by ensuring body height matches content
      window.addEventListener('load', function() {
        document.body.style.height = 'auto';
        document.body.style.minHeight = 'auto';
      });
    </script>
  </body>
</html>`;
};



