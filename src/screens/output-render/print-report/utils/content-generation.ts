import type { IContentExtractionOptions, IDatabaseConnectionInfo } from '../types';
import { findBestDataForSection } from './database-utils';
import { snapshotChartsFromOriginal } from './charts/snapshot';

/**
 * Generate complete data from database using intelligent matching
 */
export const generateCompleteDataFromDatabase = async (
  allData: Map<string, any[]>, 
  sectionTitle: string,
  connectionInfo?: IDatabaseConnectionInfo
): Promise<string | null> => {
  console.log(`🚀 Generating complete data for section: "${sectionTitle}"`);
  
  // Find the best matching data for this section
  const sectionData = findBestDataForSection(allData, sectionTitle, connectionInfo?.outputTableName);
  
  if (!sectionData || sectionData.length === 0) {
    console.log('❌ No data found for section');
    return null;
  }

  console.log(`✅ Found ${sectionData.length} rows for section "${sectionTitle}"`);

  // Filter out completely empty rows
  const validData = sectionData.filter(row => {
    const values = Object.values(row);
    return values.some(val => val !== null && val !== undefined && val !== '');
  });

  if (validData.length === 0) {
    console.log('❌ No valid data after filtering');
    return null;
  }

  // Get meaningful columns (not all null/empty)
  const allHeaders = Object.keys(validData[0]);
  const meaningfulHeaders = allHeaders.filter(header => {
    const columnValues = validData.map(row => row[header]);
    const nonEmptyValues = columnValues.filter(val => val !== null && val !== undefined && val !== '');
    return nonEmptyValues.length > validData.length * 0.05; // At least 5% non-empty
  });

  // console.debug meta

  // Determine which columns are predominantly numeric to align them to the right
  const isNumericColumnByHeader = new Map<string, boolean>();
  meaningfulHeaders.forEach((header) => {
    const values = validData
      .map((row) => row[header])
      .filter((val) => val !== null && val !== undefined && val !== '');
    const numericCount = values.filter((val) => {
      if (typeof val === 'number') return true;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed !== '' && !Number.isNaN(Number(trimmed));
      }
      return false;
    }).length;
    const isNumeric = values.length > 0 && numericCount / values.length >= 0.7;
    isNumericColumnByHeader.set(header, isNumeric);
  });

  // Helper: build a table for a subset of headers (used to split very wide tables)
  const buildTableForHeaders = (headersSubset: string[], startIdx: number, endIdx: number): string => {
    const subsetCount = headersSubset.length;
    const widthPercent = subsetCount > 0 ? (100 / subsetCount).toFixed(2) : '100';
    let subsetColgroup = '<colgroup>';
    headersSubset.forEach(() => {
      subsetColgroup += `<col style="width: ${widthPercent}%" />`;
    });
    subsetColgroup += '</colgroup>';

    let html = '';
    html += `<div style="margin: 12px 0 6px 0; font-size: 9pt; color: #555;">Columns ${startIdx}-${endIdx} of ${meaningfulHeaders.length}</div>`;
    html += `<table style="width: 100%; table-layout: fixed; border-collapse: collapse; border-spacing: 0; background: white; font-size: 10pt;">`;
    html += subsetColgroup;
    html += `<thead><tr style="background-color: #f0f0f0;">`;
    headersSubset.forEach((header) => {
      const isNumeric = isNumericColumnByHeader.get(header) === true;
      const headerAlign = isNumeric ? 'right' : 'left';
      html += `<th style="padding: 6px; text-align: ${headerAlign}; font-weight: bold; color: black; background-color: #f7f7f7; font-size: 9pt;">${header}</th>`;
    });
    html += `</tr></thead><tbody>`;

    validData.forEach((row, rIndex) => {
      html += `<tr style="background-color: ${rIndex % 2 === 0 ? 'white' : '#f9f9f9'};">`;
      headersSubset.forEach((header) => {
        const cellValue = row[header];
        let displayValue = '';
        if (cellValue !== null && cellValue !== undefined) {
          if (typeof cellValue === 'number') {
            if (Number.isInteger(cellValue)) {
              displayValue = cellValue.toString();
            } else {
              const formatted = cellValue.toFixed(6).replace(/\.?0+$/, '');
              displayValue = formatted;
            }
          } else {
            const raw = String(cellValue).trim();
            // If the string looks numeric, format it like a number to keep it compact
            if (raw !== '' && !Number.isNaN(Number(raw))) {
              const num = Number(raw);
              if (Number.isInteger(num)) {
                displayValue = num.toString();
              } else {
                const formatted = num.toFixed(6).replace(/\.?0+$/, '');
                displayValue = formatted;
              }
            } else {
              displayValue = raw;
            }
          }
        }
        const isNumeric = isNumericColumnByHeader.get(header) === true;
        const align = isNumeric ? 'right' : 'left';
        const cellClass = isNumeric ? ' class="numeric"' : '';
        html += `<td${cellClass} style="padding: 6px; text-align: ${align}; color: black; background: inherit; font-size: 9pt; word-wrap: break-word; overflow-wrap: anywhere; word-break: break-word; white-space: normal;">${displayValue}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    return html;
  };

  // For a professional single-table print, avoid splitting columns by default
  // You can tune this threshold if ever needed
  const maxColumnsPerTable = 1000; // effectively no split

  let tableHTML = `
    <div style="padding: 6px 0; margin: 6px 0; background: transparent; page-break-inside: avoid;">
      <h4 style="margin: 0 0 10px 0; color: #111; font-size: 16pt; font-weight: 700; border-bottom: 1px solid #999; padding-bottom: 6px;">${sectionTitle}</h4>
      <div style="overflow: visible; width: 100%;">
  `;

  if (meaningfulHeaders.length <= maxColumnsPerTable) {
    // Mark wide table to allow tighter typography in CSS
    const isWide = meaningfulHeaders.length > 8;
    const subsetCount = meaningfulHeaders.length;
    const widthPercent = subsetCount > 0 ? (100 / subsetCount).toFixed(2) : '100';
    let subsetColgroup = '<colgroup>';
    meaningfulHeaders.forEach(() => {
      subsetColgroup += `<col style=\"width: ${widthPercent}%\" />`;
    });
    subsetColgroup += '</colgroup>';

    let html = '';
    html += `<table class=\"print-table ${isWide ? 'wide-table' : ''}\" style=\"width: 100%; table-layout: fixed; border-collapse: collapse; border-spacing: 0; background: white; font-size: 10pt;\">`;
    html += subsetColgroup;
    html += `<thead><tr style=\"background-color: #f0f0f0;\">`;
    meaningfulHeaders.forEach((header) => {
      const isNumeric = isNumericColumnByHeader.get(header) === true;
      const headerAlign = isNumeric ? 'right' : 'left';
      html += `<th style=\"padding: 6px; text-align: ${headerAlign}; font-weight: bold; color: black; background-color: #f7f7f7; font-size: 9pt;\">${header}</th>`;
    });
    html += `</tr></thead><tbody>`;
    validData.forEach((row, rIndex) => {
      html += `<tr style=\"background-color: ${rIndex % 2 === 0 ? 'white' : '#f9f9f9'};\">`;
      meaningfulHeaders.forEach((header) => {
        const cellValue = row[header];
        let displayValue = '';
        if (cellValue !== null && cellValue !== undefined) {
          if (typeof cellValue === 'number') {
            if (Number.isInteger(cellValue)) {
              displayValue = cellValue.toString();
            } else {
              const formatted = cellValue.toFixed(6).replace(/\.?0+$/, '');
              displayValue = formatted;
            }
          } else {
            displayValue = String(cellValue);
          }
        }
        const isNumeric = isNumericColumnByHeader.get(header) === true;
        const align = isNumeric ? 'right' : 'left';
        const cellClass = isNumeric ? ' class=\"numeric\"' : '';
        html += `<td${cellClass} style=\"padding: 6px; text-align: ${align}; color: black; background: inherit; font-size: 9pt; word-wrap: break-word; overflow-wrap: anywhere; word-break: break-word; white-space: normal;\">${displayValue}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;
    tableHTML += html;
  } else {
    for (let start = 0; start < meaningfulHeaders.length; start += maxColumnsPerTable) {
      const end = Math.min(start + maxColumnsPerTable, meaningfulHeaders.length);
      tableHTML += buildTableForHeaders(meaningfulHeaders.slice(start, end), start + 1, end);
      if (end < meaningfulHeaders.length) {
        tableHTML += `<div style="height: 8px;"></div>`;
      }
    }
  }

  tableHTML += `
      </div>
      <p style="margin-top: 10px; font-size: 8pt; color: #666; font-style: italic;">
        ✅ Complete Dataset: ${validData.length} total rows | ${meaningfulHeaders.length} columns | Generated from database
      </p>
    </div>
  `;

  // console.debug table rows
  return tableHTML;
};

/**
 * Extract content from DOM element with enhanced processing
 */
export const extractSectionContent = async (
  element: HTMLElement, 
  _sectionTitle: string,
  options: IContentExtractionOptions = {}
): Promise<string> => {
  console.log('Extracting content from element with HTML length:', element.innerHTML.length);
  console.log('Element classes:', element.className);
  console.log('Element contains tables:', element.querySelectorAll('table').length);
  console.log('Element contains SVGs:', element.querySelectorAll('svg').length);
  
  // Try database extraction first if this is a table section
  const hasTable = element.querySelector('table');
  if (hasTable) {
    console.log('🔄 Found table in DOM fallback, attempting database extraction...');
    
    try {
      // This would need connection info passed in - for now, skip database fallback
      // const allData = await getAllDatabaseData(connectionInfo);
      // if (allData.size > 0) {
      //   const completeHTML = await generateCompleteDataFromDatabase(allData, sectionTitle);
      //   if (completeHTML) {
      //     console.log('✅ Fallback database extraction successful');
      //     return completeHTML;
      //   }
      // }
    } catch (error) {
      console.error('❌ Error in fallback database extraction:', error);
    }
  }
  
  // Fallback to DOM manipulation
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Snapshot charts directly from the live output BEFORE any manipulation
  // This preserves the exact on-screen rendering (no re-layout) by embedding images/SVGs
  const didSnapshot = await snapshotChartsFromOriginal(element, clonedElement);
  
  // Remove interactive elements if not preserving them
  if (!options.includeInteractiveElements) {
    const unwantedElements = clonedElement.querySelectorAll(
      'button, input[type="button"], input[type="submit"], [role="button"], [class*="fui-CardFooter"], [class*="Menu"], [class*="menu"]'
    );
    console.log('Removing', unwantedElements.length, 'unwanted elements');
    unwantedElements.forEach(el => el.remove());
  }

  // Expand scrollable content if requested
  if (options.expandScrollableContent !== false) {
    expandScrollableContent(clonedElement);
  }

  // If snapshotting already captured charts, skip heavy re-rendering logic
  if (!didSnapshot) {
    console.log('🎨 Processing charts with enhanced rendering (fallback)...');
    try {
      await handlePlotlyCharts(clonedElement);
      console.log('✅ Plotly chart processing completed');
    } catch (error) {
      console.error('❌ Error processing Plotly charts:', error);
    }
    
    try {
      handleGenericCharts(clonedElement);
      console.log('✅ Generic chart processing completed');
    } catch (error) {
      console.error('❌ Error processing generic charts:', error);
    }
  } else {
    console.log('⚡ Charts snapshotted from output; skipping re-render processing.');
  }
  
  // Final waits and forced rendering are heavy; only run if charts exist
  const hasAnyCharts = !didSnapshot && !!clonedElement.querySelector('[class*="plotly"], [class*="chart"], [class*="graph"], svg, canvas');
  if (hasAnyCharts) {
    console.log('⏳ Final wait for chart rendering completion...');
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('🔄 Forcing chart data to load and render...');
    await forceChartDataLoading(clonedElement);
  } else {
    console.log('⚡ Skipping final chart waits; no charts in this section.');
  }
  
  // CRITICAL: Fix empty chart containers by replacing them with compact placeholders
  console.log('🔧 Fixing empty chart containers...');
  fixEmptyChartContainers(clonedElement);
  
  // Additional short settle
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // CRITICAL: Final verification - check if we accidentally replaced charts with data
  console.log('🔍 Final verification: checking for accidentally replaced charts...');
  await verifyChartReplacements(clonedElement);

  // Apply containment wrapper to the entire cloned element
  clonedElement.style.cssText += `
    position: relative;
    overflow: visible;
    background: white;
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid #eee;
    border-radius: 4px;
    page-break-inside: avoid;
  `;

  // If the section has no tables, try to transform label/value text into a simple table for professional look
  const existingTables = clonedElement.querySelectorAll('table');
  if (existingTables.length === 0) {
    const text = clonedElement.innerText || '';
    const lines = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);
    if (lines.length >= 2) {
      const tableHTML = buildKeyValueTableFromLines(lines);
      if (tableHTML) {
        const container = document.createElement('div');
        container.innerHTML = tableHTML;
        // Replace content with table while preserving outer wrapper
        clonedElement.innerHTML = container.innerHTML;
      }
    }
  }

  const finalHTML = clonedElement.outerHTML;
  console.log('Final extracted HTML length:', finalHTML.length);
  
  return finalHTML;
};

/**
 * Build a simple two-column table from plain text lines.
 */
const buildKeyValueTableFromLines = (lines: string[]): string | null => {
  if (lines.length < 2) return null;
  const rows: Array<{ key: string; value: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const delimIdx = line.indexOf(':');
    if (delimIdx > 0 && delimIdx < line.length - 1) {
      const key = line.substring(0, delimIdx).trim();
      const value = line.substring(delimIdx + 1).trim();
      if (key && value) { rows.push({ key, value }); continue; }
    }
    if (i + 1 < lines.length) {
      const next = lines[i + 1];
      if (next && next.length > 0) {
        rows.push({ key: line, value: next });
        i += 1;
      }
    }
  }
  if (rows.length === 0) return null;
  const headers = ['Field', 'Value'];
  const table = [`<table class=\"kv-table\">`];
  table.push('<thead><tr>');
  headers.forEach(h => table.push(`<th class=\"kv-th\">${h}</th>`));
  table.push('</tr></thead><tbody>');
  rows.forEach((r) => {
    table.push('<tr>');
    table.push(`<td class=\"kv-td\">${r.key}</td>`);
    table.push(`<td class=\"kv-td\">${r.value}</td>`);
    table.push('</tr>');
  });
  table.push('</tbody></table>');
  return table.join('');
};

// snapshotChartsFromOriginal moved to './charts/snapshot'

/**
 * Expand scrollable content within an element
 */
const expandScrollableContent = (element: HTMLElement): void => {
  console.log('🔍 Expanding scrollable content in element:', element.tagName, element.className);
  
  const allElements = element.querySelectorAll('*');
  let expandedCount = 0;
  
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    
    // Remove height constraints that might limit content
    if (htmlEl.style.height && (htmlEl.style.height !== 'auto' && htmlEl.style.height !== '100%')) {
      console.log(`  📏 Removing height constraint: ${htmlEl.style.height} -> auto`);
      htmlEl.style.height = 'auto';
      expandedCount++;
    }
    
    // Remove max-height constraints
    if (htmlEl.style.maxHeight && htmlEl.style.maxHeight !== 'none') {
      console.log(`  📏 Removing max-height constraint: ${htmlEl.style.maxHeight} -> none`);
      htmlEl.style.maxHeight = 'none';
      expandedCount++;
    }
    
    // Remove overflow hidden/scroll to show all content
    if (htmlEl.style.overflow === 'hidden' || htmlEl.style.overflow === 'scroll' || htmlEl.style.overflow === 'auto') {
      console.log(`  📜 Removing overflow constraint: ${htmlEl.style.overflow} -> visible`);
      htmlEl.style.overflow = 'visible';
      expandedCount++;
    }
    
    if (htmlEl.style.overflowY === 'hidden' || htmlEl.style.overflowY === 'scroll' || htmlEl.style.overflowY === 'auto') {
      console.log(`  📜 Removing overflowY constraint: ${htmlEl.style.overflowY} -> visible`);
      htmlEl.style.overflowY = 'visible';
      expandedCount++;
    }
    
    if (htmlEl.style.overflowX === 'hidden' || htmlEl.style.overflowX === 'scroll' || htmlEl.style.overflowX === 'auto') {
      console.log(`  📜 Removing overflowX constraint: ${htmlEl.style.overflowX} -> visible`);
      htmlEl.style.overflowX = 'visible';
      expandedCount++;
    }
    
    // Also check computed styles for scrollable content
    try {
      const computedStyle = window.getComputedStyle(htmlEl);
      if (computedStyle.overflow === 'scroll' || computedStyle.overflow === 'auto' || 
          computedStyle.maxHeight !== 'none' || computedStyle.height !== 'auto') {
        console.log(`  📜 Found computed scrollable styles - forcing expansion`);
        htmlEl.style.cssText += `
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
        `;
        expandedCount++;
      }
    } catch (error) {
      // Ignore errors from computed styles
    }
    
    // Copy important styling properties for print
    htmlEl.style.cssText += `
      background-color: white !important;
      color: black !important;
      border-color: #333 !important;
    `;
  });
  
  // Special handling for Plotly charts
  handlePlotlyCharts(element);
  
  // Handle table containers specifically
  const tableContainers = element.querySelectorAll('div');
  tableContainers.forEach(container => {
    const containerEl = container as HTMLElement;
    const table = containerEl.querySelector('table');
    
    if (table) {
      const computedStyle = window.getComputedStyle(containerEl);
      if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll' || 
          computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
        
        console.log('Found scrollable table container, expanding...');
        containerEl.style.height = 'auto';
        containerEl.style.maxHeight = 'none';
        containerEl.style.overflow = 'visible';
        containerEl.style.overflowY = 'visible';
        containerEl.style.overflowX = 'visible';
        
        // Add container styling to keep table contained
        containerEl.style.border = '1px solid #ddd';
        containerEl.style.padding = '10px';
        containerEl.style.marginBottom = '20px';
        containerEl.style.backgroundColor = 'white';
        
        // Make the table show all rows
        if (table) {
          (table as HTMLElement).style.height = 'auto';
          (table as HTMLElement).style.maxHeight = 'none';
          (table as HTMLElement).style.width = '100%';
          (table as HTMLElement).style.tableLayout = 'auto';
        }
      }
    }
  });
  
  console.log(`✅ Content expansion complete - expanded ${expandedCount} elements`);
};

/**
 * Wait for charts to be fully loaded and rendered
 */
const waitForChartReadiness = async (element: HTMLElement): Promise<void> => {
  console.log('⏳ Waiting for charts to be fully ready...');
  // Fast path: if there are no charts/SVG/canvas, skip all waits
  const fastCheck = element.querySelector('[class*="plotly"], [class*="chart"], [class*="graph"], svg, canvas');
  if (!fastCheck) {
    console.log('⚡ No charts detected in element. Skipping chart readiness waits.');
    return;
  }
  
  // Wait for any pending chart renders (short)
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Check if Plotly is available and charts are loaded
  if ((window as any).Plotly) {
    const plotlyContainers = element.querySelectorAll('div[class*="plotly"], .js-plotly-plot, [data-unformatted-plot]');
    
    for (const container of plotlyContainers) {
      const plotlyDiv = container as HTMLElement;
      if ((plotlyDiv as any)._fullData) {
        console.log('✅ Chart data is loaded, brief settle wait...');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }
  
  // Also wait for any CSS animations or transitions to complete
  const animatedElements = element.querySelectorAll('[style*="animation"], [style*="transition"], [class*="animate"], [class*="fade"]');
  if (animatedElements.length > 0) {
    console.log(`⏳ Found ${animatedElements.length} animated elements, waiting for animations to complete...`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Wait for any pending image loads
  const images = element.querySelectorAll('img');
  if (images.length > 0) {
    console.log(`⏳ Found ${images.length} images, waiting for them to load...`);
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // Don't wait forever if image fails
      });
    });
    await Promise.all(imagePromises);
  }
  
  // CRITICAL: Wait for chart data to be fully rendered
  console.log('⏳ Waiting for chart data rendering to complete...');
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Force any lazy-loaded charts to render
  const chartElements = element.querySelectorAll('[class*="chart"], [class*="graph"], [class*="plotly"], svg, canvas');
  console.log(`⏳ Found ${chartElements.length} chart elements, ensuring they are fully rendered...`);
  
  // Trigger any pending renders
  chartElements.forEach((chartEl) => {
    const chartElement = chartEl as HTMLElement;
    // Force a reflow to ensure rendering
    chartElement.style.display = 'none';
    chartElement.offsetHeight; // Force reflow
    chartElement.style.display = 'block';
  });
  
  // CRITICAL: Force Plotly charts to re-render if they exist
  if ((window as any).Plotly) {
    const plotlyContainers = element.querySelectorAll('div[class*="plotly"], .js-plotly-plot, [data-unformatted-plot]');
    console.log(`🔄 Forcing ${plotlyContainers.length} Plotly charts to re-render...`);
    
    for (const container of plotlyContainers) {
      const plotlyDiv = container as HTMLElement;
      try {
        // Force a complete re-render
        (window as any).Plotly.relayout(plotlyDiv, {
          width: plotlyDiv.offsetWidth || 800,
          height: plotlyDiv.offsetHeight || 450,
          autosize: false
        });
        
        // Also try to redraw the plot
        if ((plotlyDiv as any)._fullData) {
          (window as any).Plotly.redraw(plotlyDiv);
        }
      } catch (error) {
        console.log('⚠️ Could not force Plotly re-render:', error);
      }
    }
    
    // Wait for re-renders to complete
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  
  // Final wait for rendering
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log('✅ Chart readiness check completed');
};

/**
 * Handle Plotly charts for printing with enhanced rendering
 */
const handlePlotlyCharts = async (element: HTMLElement): Promise<void> => {
  console.log('🎨 Processing Plotly charts for printing with enhanced rendering...');
  
  // First, wait for charts to be fully ready
  await waitForChartReadiness(element);
  
  // Find all potential Plotly containers
  const plotlyContainers = element.querySelectorAll('div[class*="plotly"], .js-plotly-plot, [data-unformatted-plot]');
  
  console.log(`📊 Found ${plotlyContainers.length} potential Plotly containers`);
  if (plotlyContainers.length === 0) {
    console.log('⚡ No Plotly containers. Skipping Plotly processing.');
    return;
  }
  
  // Process each container with enhanced rendering
  for (let index = 0; index < plotlyContainers.length; index++) {
    const container = plotlyContainers[index];
    const plotlyDiv = container as HTMLElement;
    console.log(`🎨 Processing Plotly chart ${index + 1}:`);
    console.log(`  - Container classes: ${plotlyDiv.className}`);
    console.log(`  - Container ID: ${plotlyDiv.id}`);
    
                          // Force the Plotly container to be visible and properly sized with COMPLETE WIDTH but CONTROLLED HEIGHT
       plotlyDiv.style.cssText += `
         width: 100vw !important;
         max-width: none !important;
         min-width: 100% !important;
         height: 400px !important;
         min-height: 300px !important;
         max-height: 500px !important;
         overflow: visible !important;
         position: relative !important;
         display: block !important;
         background: white !important;
         border: none !important;
         margin: 15px 0 !important;
         padding: 15px !important;
         left: 0 !important;
         right: 0 !important;
         transform: none !important;
       `;
    
    // Try to force Plotly to re-render if it's available
    try {
      if ((window as any).Plotly && (plotlyDiv as any)._fullData) {
        console.log(`  🔄 Forcing Plotly re-render for chart ${index + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for any pending renders
        
                                              // Force a resize to ensure full rendering with COMPLETE WIDTH but CONTROLLED HEIGHT
           (window as any).Plotly.relayout(plotlyDiv, {
             width: Math.max(800, window.innerWidth || 1200),
             height: 450, // slightly taller for readability
             autosize: false,
             margin: { l: 50, r: 20, t: 40, b: 50 }
           });
        
        // Wait a bit more for the re-render to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`  ✅ Plotly re-render completed for chart ${index + 1}`);
      }
    } catch (error) {
      console.log(`  ⚠️ Could not force Plotly re-render:`, error);
    }
    
    // Find SVG elements within the Plotly container
    const svgElements = plotlyDiv.querySelectorAll('svg');
    console.log(`  - Found ${svgElements.length} SVG elements`);
    
         for (let svgIndex = 0; svgIndex < svgElements.length; svgIndex++) {
       const svg = svgElements[svgIndex];
       const svgElement = svg as SVGElement;
       console.log(`    📈 Processing SVG ${svgIndex + 1}`);
      
             // Ensure SVG is properly sized and visible with COMPLETE WIDTH but CONTROLLED HEIGHT
       svgElement.style.cssText += `
         width: 100vw !important;
         height: 350px !important;
         max-width: none !important;
         min-width: 100% !important;
         min-height: 300px !important;
         max-height: 450px !important;
         display: block !important;
         background: white !important;
         overflow: visible !important;
         left: 0 !important;
         right: 0 !important;
         transform: none !important;
       `;
      
                           // Set proper SVG attributes for printing with COMPLETE WIDTH but AUTO HEIGHT to fit content
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', 'auto');
        
        // Get the actual SVG content dimensions to set proper viewBox
        const svgRect = svgElement.getBoundingClientRect();
        const actualWidth = svgRect.width || 1200;
        const actualHeight = svgRect.height || 300; // Reduced default height
        svgElement.setAttribute('viewBox', `0 0 ${actualWidth} ${actualHeight}`);
        
        // CRITICAL: If SVG has minimal content, reduce its height to prevent oversized empty containers
        const svgDataContent = svgElement.innerHTML;
        if (svgDataContent && svgDataContent.length < 200) {
          console.log(`    ⚠️ SVG ${svgIndex + 1} has minimal content, reducing height to prevent oversized container`);
          svgElement.style.height = '200px !important';
          svgElement.style.minHeight = '150px !important';
        }
       svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      
             // Ensure SVG content is fully visible
       const svgContent = svgElement.innerHTML;
       if (svgContent && svgContent.length > 100) {
         console.log(`    ✅ SVG ${svgIndex + 1} has substantial content (${svgContent.length} chars)`);
       } else {
         console.log(`    ⚠️ SVG ${svgIndex + 1} has minimal content, may need more time to render`);
         
         // CRITICAL: If SVG has minimal content, try to force Plotly to render data
         if ((window as any).Plotly && (plotlyDiv as any)._fullData) {
           console.log(`    🔄 Attempting to force data rendering for SVG ${svgIndex + 1}...`);
           try {
             // Force a complete re-render with data
             (window as any).Plotly.relayout(plotlyDiv, {
               width: plotlyDiv.offsetWidth || 800,
               height: plotlyDiv.offsetHeight || 450,
               autosize: false
             });
             
             // Wait for data to render
             await new Promise(resolve => setTimeout(resolve, 1000));
             
             // Check if content is now available
             const newSvgContent = svgElement.innerHTML;
             if (newSvgContent && newSvgContent.length > 100) {
               console.log(`    ✅ SVG ${svgIndex + 1} now has content after forced render (${newSvgContent.length} chars)`);
             } else {
               console.log(`    ❌ SVG ${svgIndex + 1} still has minimal content after forced render`);
             }
           } catch (error) {
             console.log(`    ⚠️ Could not force data rendering:`, error);
           }
                  }
       }
     }
     
     // Handle Canvas elements (backup for some chart types)
    const canvasElements = plotlyDiv.querySelectorAll('canvas');
    console.log(`  - Found ${canvasElements.length} Canvas elements`);
    
    canvasElements.forEach((canvas, canvasIndex) => {
      const canvasElement = canvas as HTMLCanvasElement;
      console.log(`    🖼️ Processing Canvas ${canvasIndex + 1}`);
      
      // Convert canvas to image for better print support
      try {
        const dataURL = canvasElement.toDataURL('image/png', 1.0); // High quality
        const img = document.createElement('img');
        img.src = dataURL;
        img.style.cssText = `
          width: 100vw !important;
          height: auto !important;
          max-width: none !important;
          min-width: 100% !important;
          display: block !important;
          margin: 15px 0 !important;
          border: none !important;
          left: 0 !important;
          right: 0 !important;
          transform: none !important;
        `;
        
        // Replace canvas with image for printing
        canvasElement.parentNode?.insertBefore(img, canvasElement);
        canvasElement.style.display = 'none';
        
        console.log(`    ✅ Canvas converted to high-quality image for printing`);
      } catch (error) {
        console.log(`    ⚠️ Could not convert canvas to image:`, error);
        // Fallback: just style the canvas
        canvasElement.style.cssText += `
          width: 100% !important;
          height: auto !important;
          max-width: none !important;
          display: block !important;
        `;
      }
    });
    
    // Remove any Plotly toolbar or controls that shouldn't be printed
    const toolbars = plotlyDiv.querySelectorAll('.modebar, .plotly-modebar, [class*="toolbar"]');
    toolbars.forEach(toolbar => {
      (toolbar as HTMLElement).style.display = 'none';
    });
    
    console.log(`  ✅ Plotly chart ${index + 1} processed for printing`);
  }
  
  // Also handle generic SVG elements that might not be in Plotly containers
  const standaloneSvgs = element.querySelectorAll('svg:not([class*="plotly"] svg):not(.js-plotly-plot svg)');
  console.log(`📈 Found ${standaloneSvgs.length} standalone SVG elements`);
  
  standaloneSvgs.forEach((svg, index) => {
    const svgElement = svg as SVGElement;
    console.log(`📈 Processing standalone SVG ${index + 1}`);
    
                   // Ensure standalone SVGs are also properly styled for printing with COMPLETE WIDTH but AUTO HEIGHT to fit content
      svgElement.style.cssText += `
        width: 100vw !important;
        height: auto !important;
        max-width: none !important;
        min-width: 100% !important;
        max-height: none !important;
        display: block !important;
        margin: 15px 0 !important;
        background: white !important;
        border: none !important;
        padding: 15px !important;
        left: 0 !important;
        right: 0 !important;
        transform: none !important;
      `;
      
      // Ensure proper SVG attributes with COMPLETE WIDTH but AUTO HEIGHT to fit content
      if (!svgElement.getAttribute('viewBox')) {
        const width = svgElement.getAttribute('width') || '1200';
        const height = svgElement.getAttribute('height') || '300'; // Reduced default height
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }
      
      // CRITICAL: Check if standalone SVG has minimal content and reduce height accordingly
      const standaloneSvgContent = svgElement.innerHTML;
      if (standaloneSvgContent && standaloneSvgContent.length < 200) {
        console.log(`    ⚠️ Standalone SVG has minimal content, reducing height to prevent oversized container`);
        svgElement.style.height = '200px !important';
        svgElement.style.minHeight = '150px !important';
      }
     svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  });
  
  console.log('✅ Enhanced Plotly chart processing complete');
  
  // CRITICAL: Verify that charts actually contain data
  console.log('🔍 Verifying chart data content...');
  const allSvgs = element.querySelectorAll('svg');
  let chartsWithData = 0;
  let chartsWithoutData = 0;
  
  allSvgs.forEach((svg, index) => {
    const svgElement = svg as SVGElement;
    const svgContent = svgElement.innerHTML;
    if (svgContent && svgContent.length > 200) {
      chartsWithData++;
      console.log(`✅ SVG ${index + 1} has data: ${svgContent.length} chars`);
    } else {
      chartsWithoutData++;
      console.log(`❌ SVG ${index + 1} missing data: ${svgContent.length} chars`);
      
      // CRITICAL: Reduce height of empty chart containers to prevent oversized appearance
      const chartContainer = svgElement.closest('[class*="plotly"], [class*="chart"], [class*="graph"], [class*="visualization"]');
      if (chartContainer) {
        console.log(`    🔧 Reducing height of empty chart container ${index + 1}`);
        (chartContainer as HTMLElement).style.height = '200px !important';
        (chartContainer as HTMLElement).style.minHeight = '150px !important';
        (chartContainer as HTMLElement).style.maxHeight = '250px !important';
      }
      
      // Also reduce the SVG itself
      svgElement.style.height = '200px !important';
      svgElement.style.minHeight = '150px !important';
      svgElement.style.maxHeight = '250px !important';
    }
  });
  
  console.log(`📊 Chart data verification: ${chartsWithData} with data, ${chartsWithoutData} without data`);
  
  if (chartsWithoutData > 0) {
    console.warn('⚠️ Some charts are missing data - container heights have been reduced to prevent oversized appearance');
  }
};

/**
 * Handle generic charts and visualizations for printing
 */
const handleGenericCharts = (element: HTMLElement): void => {
  console.log('📊 Processing generic charts and visualizations...');
  // Fast path: if there are no chart-like elements, return immediately
  if (!element.querySelector('[class*="chart"], [class*="graph"], [class*="visualization"], svg, canvas')) {
    console.log('⚡ No generic charts found. Skipping generic chart processing.');
    return;
  }
  
  // First, expand any collapsed chart containers
  const collapsedContainers = element.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], [class*="collapsed"], [class*="hidden"]');
  console.log(`🔍 Found ${collapsedContainers.length} potentially collapsed containers`);
  
  collapsedContainers.forEach((container, index) => {
    const containerEl = container as HTMLElement;
    // Check if this container has chart-like content
    if (containerEl.querySelector('svg, canvas, [class*="chart"], [class*="graph"]')) {
      console.log(`📊 Expanding collapsed chart container ${index + 1}`);
      containerEl.style.display = 'block';
      containerEl.style.visibility = 'visible';
      containerEl.style.height = 'auto';
      containerEl.style.maxHeight = 'none';
      containerEl.style.overflow = 'visible';
    }
  });
  
  // CRITICAL: Force all chart data to be visible and rendered
  console.log('🔍 Ensuring all chart data is visible and rendered...');
  const allChartElements = element.querySelectorAll('svg, canvas, [class*="chart"], [class*="graph"], [class*="plotly"]');
  
  allChartElements.forEach((chartEl, index) => {
    const chartElement = chartEl as HTMLElement;
    console.log(`📊 Ensuring chart element ${index + 1} is fully visible:`, chartElement.tagName, chartElement.className);
    
    // Force visibility and proper sizing
    chartElement.style.cssText += `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      position: relative !important;
      z-index: 1000 !important;
    `;
    
    // Remove any transforms that might hide content
    chartElement.style.transform = 'none';
    chartElement.style.transformOrigin = 'initial';
    
    // Ensure parent containers are also visible
    let parent = chartElement.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      if (parent.style.display === 'none' || parent.style.visibility === 'hidden') {
        console.log(`📊 Making parent visible:`, parent.tagName, parent.className);
        parent.style.display = 'block';
        parent.style.visibility = 'visible';
        parent.style.overflow = 'visible';
      }
      parent = parent.parentElement;
      depth++;
    }
  });
  
  // Handle any remaining chart-like elements
  const chartElements = element.querySelectorAll('[class*="chart"], [class*="graph"], [class*="visualization"]');
  console.log(`📈 Found ${chartElements.length} generic chart elements`);
  
  chartElements.forEach((chartEl, index) => {
    const chartElement = chartEl as HTMLElement;
    console.log(`📊 Processing generic chart ${index + 1}: ${chartElement.className}`);
    
                          // Ensure chart container is properly sized for printing with COMPLETE WIDTH but CONTROLLED HEIGHT
       chartElement.style.cssText += `
         width: 100vw !important;
         max-width: none !important;
         min-width: 100% !important;
         height: 400px !important;
         min-height: 300px !important;
         max-height: 500px !important;
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
       `;
      
      // CRITICAL: Check if chart container has minimal content and reduce height accordingly
      const chartContent = chartElement.innerHTML;
      if (chartContent && chartContent.length < 500) {
        console.log(`    ⚠️ Chart container has minimal content, reducing height to prevent oversized container`);
        chartElement.style.height = '200px !important';
        chartElement.style.minHeight = '150px !important';
      }
    
    // Look for any SVG or canvas elements within the chart
    const svgs = chartElement.querySelectorAll('svg');
    const canvases = chartElement.querySelectorAll('canvas');
    
    if (svgs.length > 0) {
      console.log(`  📈 Found ${svgs.length} SVG elements in generic chart`);
      svgs.forEach((svg) => {
        const svgElement = svg as SVGElement;
        svgElement.style.cssText += `
          width: 100vw !important;
          height: auto !important;
          max-width: none !important;
          min-width: 100% !important;
          max-height: none !important;
          display: block !important;
          background: white !important;
          overflow: visible !important;
          left: 0 !important;
          right: 0 !important;
          transform: none !important;
        `;
      });
    }
    
    if (canvases.length > 0) {
      console.log(`  🖼️ Found ${canvases.length} Canvas elements in generic chart`);
      canvases.forEach((canvas) => {
        const canvasElement = canvas as HTMLCanvasElement;
        try {
          const dataURL = canvasElement.toDataURL('image/png', 1.0);
          const img = document.createElement('img');
          img.src = dataURL;
                  img.style.cssText = `
          width: 100vw !important;
          height: auto !important;
          max-width: none !important;
          min-width: 100% !important;
          display: block !important;
          margin: 15px 0 !important;
          border: none !important;
          left: 0 !important;
          right: 0 !important;
          transform: none !important;
        `;
          
          canvasElement.parentNode?.insertBefore(img, canvasElement);
          canvasElement.style.display = 'none';
          
          console.log(`    ✅ Canvas converted to high-quality image for printing`);
        } catch (error) {
          console.log(`    ⚠️ Could not convert canvas to image:`, error);
        }
      });
    }
    
    console.log(`  ✅ Generic chart ${index + 1} processed for printing`);
  });
  
  console.log('✅ Generic chart processing complete');
};

/**
 * Detect and fix empty chart containers by replacing them with compact placeholders
 */
const fixEmptyChartContainers = (element: HTMLElement): void => {
  console.log('🔍 Detecting and fixing empty chart containers...');
  
  // Find all potential chart containers - be more aggressive
  const chartContainers = element.querySelectorAll('[class*="plotly"], [class*="chart"], [class*="graph"], [class*="visualization"], .js-plotly-plot, svg, canvas');
  let fixedCount = 0;
  
  chartContainers.forEach((container, index) => {
    const containerEl = container as HTMLElement;
    const svgElements = containerEl.querySelectorAll('svg');
    const canvasElements = containerEl.querySelectorAll('canvas');
    
    // If this is a direct SVG or canvas, check it directly
    if (containerEl.tagName === 'SVG' || containerEl.tagName === 'CANVAS') {
      const hasContent = checkElementForMeaningfulContent(containerEl);
      if (!hasContent) {
        console.log(`    🔧 Replacing empty ${containerEl.tagName} ${index + 1} with compact placeholder`);
        replaceWithPlaceholder(containerEl);
        fixedCount++;
        return;
      }
    }
    
    // Check if this container has meaningful chart content
    let hasMeaningfulContent = false;
    
    // Check SVGs for data - look for actual chart data, not just axes
    svgElements.forEach(svg => {
      const svgElement = svg as SVGElement;
      if (checkElementForMeaningfulContent(svgElement)) {
        hasMeaningfulContent = true;
      }
    });
    
    // Check Canvas elements
    canvasElements.forEach(canvas => {
      const canvasElement = canvas as HTMLCanvasElement;
      if (checkElementForMeaningfulContent(canvasElement)) {
        hasMeaningfulContent = true;
      }
    });
    
         // CRITICAL: Also check if container has large height but no meaningful content
     const computedStyle = window.getComputedStyle(containerEl);
     const containerHeight = parseInt(computedStyle.height) || 0;
     const hasLargeHeight = containerHeight > 600; // Much more conservative threshold
     
     // If no meaningful content and has large height, replace with compact placeholder
     if (!hasMeaningfulContent && hasLargeHeight) {
       console.log(`    🔧 Replacing oversized empty chart container ${index + 1} (height: ${containerHeight}px) with compact placeholder`);
       replaceWithPlaceholder(containerEl);
       fixedCount++;
     } else if (!hasMeaningfulContent) {
       // Be much more conservative - only replace if we're absolutely sure it's empty
       const containerContent = containerEl.innerHTML;
       const isVeryEmpty = containerContent.length < 50 || 
                          (containerContent.includes('svg') && containerContent.length < 150);
       
       if (isVeryEmpty) {
         console.log(`    🔧 Replacing very empty chart container ${index + 1} with compact placeholder`);
         replaceWithPlaceholder(containerEl);
         fixedCount++;
       } else {
         console.log(`    ⚠️ Chart container ${index + 1} has minimal content but might still be loading, keeping it`);
       }
     }
  });
  
  console.log(`✅ Fixed ${fixedCount} empty chart containers with compact placeholders`);
};

/**
 * Check if an element has meaningful chart content
 */
const checkElementForMeaningfulContent = (element: Element): boolean => {
  if (element.tagName === 'SVG') {
    const svgElement = element as SVGElement;
    const svgContent = svgElement.innerHTML;
    
         // Check if SVG has substantial content
     if (svgContent && svgContent.length > 100) { // Reduced threshold
       // Look for actual data elements (lines, points, bars, etc.)
       const hasDataElements = svgElement.querySelector('path[d*="M"], circle[cx], rect[width], line[x1], g[clip-path]');
       const hasTextLabels = svgElement.querySelectorAll('text').length > 5; // Reduced threshold
       
       // Look for Plotly-specific data elements
       const hasPlotlyData = svgElement.querySelector('g[clip-path], g[class*="trace"], g[class*="layer"]');
       
       // CRITICAL: Check if this is just a grid with axes but no actual data
       const hasOnlyGrid = svgElement.querySelectorAll('line[x1][y1][x2][y2]').length > 12; // Increased threshold
       const hasOnlyAxes = svgElement.querySelectorAll('text').length <= 15; // Reduced threshold
       
       // If it's just a grid with axes but no data, consider it empty
       if (hasOnlyGrid && hasOnlyAxes && !hasDataElements && !hasPlotlyData) {
         console.log(`    🔍 SVG appears to be just grid/axes without data`);
         return false;
       } else if (hasDataElements || hasTextLabels || hasPlotlyData) {
         console.log(`    ✅ SVG has meaningful content: data=${!!hasDataElements}, labels=${!!hasTextLabels}, plotly=${!!hasPlotlyData}`);
         return true;
       }
     }
     
     // If SVG is very small, it might still be loading
     if (svgContent && svgContent.length < 100) { // Reduced threshold
       console.log(`    ⚠️ SVG has minimal content (${svgContent.length} chars), might still be loading`);
       // Don't immediately consider it empty - give it more time
       return true; // Assume it has content to avoid false positives
     }
    
    return false;
  } else if (element.tagName === 'CANVAS') {
    const canvasElement = element as HTMLCanvasElement;
    try {
      const imageData = canvasElement.getContext('2d')?.getImageData(0, 0, canvasElement.width, canvasElement.height);
      if (imageData && imageData.data.some(pixel => pixel !== 0)) { // Check if canvas has non-transparent pixels
        console.log(`    ✅ Canvas has non-transparent pixels`);
        return true;
      }
    } catch (error) {
      // Ignore canvas errors
    }
    console.log(`    ⚠️ Canvas appears empty or error occurred`);
    return false;
  }
  return false;
};

/**
 * Force chart data to load and render before checking if empty
 */
const forceChartDataLoading = async (element: HTMLElement): Promise<void> => {
  console.log('🔄 Forcing chart data loading and rendering...');
  // Fast path: if no charts at all, skip
  const anyChart = element.querySelector('[class*="plotly"], [class*="chart"], [class*="graph"], svg, canvas');
  if (!anyChart) {
    console.log('⚡ No chart elements found. Skipping force loading.');
    return;
  }
  
  // Force Plotly charts to re-render if available
  if ((window as any).Plotly) {
    const plotlyContainers = element.querySelectorAll('div[class*="plotly"], .js-plotly-plot, [data-unformatted-plot]');
    console.log(`🔄 Found ${plotlyContainers.length} Plotly containers, forcing re-render...`);
    
    for (const container of plotlyContainers) {
      const plotlyDiv = container as HTMLElement;
      try {
        if ((plotlyDiv as any)._fullData) {
          console.log(`  🔄 Forcing Plotly re-render for container...`);
          
          // Force a complete re-render with proper dimensions
          (window as any).Plotly.relayout(plotlyDiv, {
            width: plotlyDiv.offsetWidth || 800,
            height: plotlyDiv.offsetHeight || 450,
            autosize: false,
            margin: { l: 60, r: 60, t: 60, b: 60 }
          });
          
          // Also try to redraw the plot
          (window as any).Plotly.redraw(plotlyDiv);
          
          // Wait a bit for this specific chart to render
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.log(`  ⚠️ Could not force Plotly re-render:`, error);
      }
    }
    
    // Wait for all re-renders to complete (short)
    await new Promise(resolve => setTimeout(resolve, 700));
  }
  
  // Force any lazy-loaded charts to render
  const chartElements = element.querySelectorAll('[class*="chart"], [class*="graph"], [class*="plotly"], svg, canvas');
  console.log(`🔄 Found ${chartElements.length} chart elements, ensuring they are fully rendered...`);
  
  // Trigger any pending renders with individual waits
  for (let i = 0; i < chartElements.length; i++) {
    const chartEl = chartElements[i];
    const chartElement = chartEl as HTMLElement;
    
    // Force a reflow to ensure rendering
    chartElement.style.display = 'none';
    chartElement.offsetHeight; // Force reflow
    chartElement.style.display = 'block';
    
    // Wait a bit for each chart to render
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Final wait for rendering (short)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('✅ Chart data loading and rendering forced');
};

/**
 * Replace an element with a compact placeholder
 */
const replaceWithPlaceholder = (element: HTMLElement): void => {
  const placeholder = document.createElement('div');
  placeholder.innerHTML = `
    <div style="
      width: 100%;
      height: 120px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
      font-size: 14px;
      font-style: italic;
      text-align: center;
      padding: 20px;
      margin: 10px 0;
    ">
      📊 Chart data not available for printing
    </div>
  `;
  
  // Replace the empty container
  element.parentNode?.replaceChild(placeholder, element);
};

/**
 * Final verification to check if we accidentally replaced charts with data
 */
const verifyChartReplacements = async (element: HTMLElement): Promise<void> => {
  console.log('🔍 Verifying chart replacements...');
  
  // Look for any placeholder divs that might have replaced charts with data
  const placeholders = element.querySelectorAll('div[style*="Chart data not available"]');
  console.log(`🔍 Found ${placeholders.length} placeholder divs to verify`);
  
  for (const placeholder of placeholders) {
    const placeholderEl = placeholder as HTMLElement;
    
    // Check if this placeholder replaced a chart that actually has data
    // const _previousSibling = placeholderEl.previousElementSibling;
    // const _nextSibling = placeholderEl.nextElementSibling;
    
    // Look for nearby elements that might indicate this was a chart with data
    const nearbyChartElements = element.querySelectorAll('svg, canvas, [class*="plotly"], [class*="chart"], [class*="graph"]');
    
    // If we find chart elements nearby, this placeholder might be wrong
    if (nearbyChartElements.length > 0) {
      console.log(`⚠️ Found chart elements near placeholder - placeholder might be incorrect`);
      
      // Check if any of these charts actually have data
      let hasRealData = false;
      for (const chartEl of nearbyChartElements) {
        if (checkElementForMeaningfulContent(chartEl)) {
          hasRealData = true;
          console.log(`✅ Found chart with real data near placeholder`);
          break;
        }
      }
      
      if (hasRealData) {
        console.log(`🔧 Removing incorrect placeholder and restoring chart area`);
        // Remove the placeholder and add a note
        const noteDiv = document.createElement('div');
        noteDiv.innerHTML = `
          <div style="
            width: 100%;
            height: 200px;
            background: #e8f5e8;
            border: 1px solid #28a745;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #155724;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            margin: 10px 0;
          ">
            📊 Chart area preserved for printing
          </div>
        `;
        placeholderEl.parentNode?.replaceChild(noteDiv, placeholderEl);
      }
    }
  }
  
  console.log('✅ Chart replacement verification completed');
};

/**
 * Get all stylesheets from the current document
 */
export const getAllStylesheets = (): string => {
  let allStyles = '';
  
  try {
    for (let i = 0; i < document.styleSheets.length; i++) {
      const styleSheet = document.styleSheets[i];
      try {
        if (styleSheet.cssRules) {
          for (let j = 0; j < styleSheet.cssRules.length; j++) {
            allStyles += styleSheet.cssRules[j].cssText + '\n';
          }
        }
      } catch (e) {
        console.log('Could not access stylesheet:', e);
      }
    }
  } catch (e) {
    console.log('Error copying styles:', e);
  }
  
  return allStyles;
};