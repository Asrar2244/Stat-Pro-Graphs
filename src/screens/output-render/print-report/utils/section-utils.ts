import type { IPrintSection } from '../types';
import {
  PRINT_DEBUG,
  DATA_OUTPUT_ID_ATTR,
  PRIMARY_LAYOUT_SELECTOR,
} from './constants';

/**
 * Detect printable sections from the DOM
 */
export const detectPrintableSections = (root?: HTMLElement): IPrintSection[] => {
  if (PRINT_DEBUG) console.log('🔍 Starting section detection...');
  
  const sections: IPrintSection[] = [];
  
  if (!root) {
    console.warn('⚠️ No root element provided for section detection');
    return sections;
  }
  
  // Verify this is actually an output container
  const outputId = root.getAttribute(DATA_OUTPUT_ID_ATTR);
  if (!outputId) {
    console.warn('⚠️ Root element does not have data-output-id attribute');
    return sections;
  }
  
  if (PRINT_DEBUG) {
    console.log(`📍 Searching within output container ID: ${outputId}`);
    console.log(`📍 Root element classes: ${root.className}`);
    console.log(`📍 Root element children: ${root.children.length}`);
    console.log(`📍 Root element HTML preview: ${root.outerHTML.substring(0, 300)}...`);
  }
  
  // Strategy 1: Look for the main regressions layout container first
  // This contains all the CardTableRender and GraphPlot components
  let regressionsContainer: Element | null = null;
  
  // Only search within the provided root element
  regressionsContainer = root.querySelector(PRIMARY_LAYOUT_SELECTOR);
  
  if (!regressionsContainer) {
    // Try alternative container patterns within the root
    const alternativeSelectors = [
      'div[class*="regression"]',
      'div[class*="Regression"]',
      'div[class*="layout"]',
      'div[class*="Layout"]',
      // Look for any div that might contain cards
      'div:has(.fui-Card)',
      // Look for any div with significant content
      'div:has(table)',
      'div:has(svg)',
      'div:has(canvas)'
    ];
    
    for (const selector of alternativeSelectors) {
      try {
        regressionsContainer = root.querySelector(selector);
      if (regressionsContainer) {
        console.log(`📍 Found alternative container using: ${selector}`);
        console.log(`📍 Container classes: ${(regressionsContainer as HTMLElement).className}`);
        break;
        }
      } catch (error) {
        // Some selectors like :has() might not be supported in all browsers
        console.log(`⚠️ Selector not supported: ${selector}`);
        continue;
      }
    }
  } else {
    console.log('📍 Found regressions layout container within root');
    console.log(`📍 Container classes: ${(regressionsContainer as HTMLElement).className}`);
  }
  
  // If still no container found, try a broader search
  if (!regressionsContainer) {
    console.log('⚠️ No specific container found, searching for cards directly in root');
    const cardsInRoot = root.querySelectorAll('.fui-Card');
    if (cardsInRoot.length > 0) {
      console.log(`📍 Found ${cardsInRoot.length} cards directly in root`);
      // Use the root as the container
      regressionsContainer = root;
    }
  }
  
  if (regressionsContainer) {
    // Strategy 2: Find FluentUI Card components within the regressions layout
    const cardElements = regressionsContainer.querySelectorAll('.fui-Card');
    
    console.log(`🔍 Looking for cards in container with ${cardElements.length} children`);
    console.log(`🔍 Container HTML preview: ${regressionsContainer.outerHTML.substring(0, 200)}...`);
    
    if (cardElements.length > 0) {
      console.log(`📋 Found ${cardElements.length} FluentUI Card sections`);
      
      cardElements.forEach((cardElement, index) => {
        // Skip nested cards (child cards within parent cards)
        const parentCard = (cardElement as HTMLElement).closest('.fui-Card');
        if (parentCard && parentCard !== cardElement) {
          return;
        }
        
        // Extract title from card header or infer from content
        let title = `Section ${index + 1}`;
        
        // Try to find a title in the card header
        const headerElement = cardElement.querySelector('[class*="CardHeader"], [class*="header"], h1, h2, h3, h4, h5, h6');
        if (headerElement) {
          const headerText = headerElement.textContent?.trim();
          if (headerText && headerText.length > 0) {
            title = headerText;
            console.log(`📝 Found title for card ${index}: "${title}"`);
          }
        }
        
        // If no title found, try to infer from content
        if (title.startsWith('Section ')) {
          const hasTable = cardElement.querySelector('table');
          const hasChart = cardElement.querySelector('[class*="plotly"], svg, canvas');
          const hasScrollableContent = cardElement.querySelector('[style*="overflow"], [style*="max-height"], [class*="scroll"]');
          
          // Check for computed styles that indicate scrollable content
          let isComputedScrollable = false;
          try {
            const computedStyle = window.getComputedStyle(cardElement);
            isComputedScrollable = computedStyle.overflow === 'auto' || 
                                  computedStyle.overflow === 'scroll' || 
                                  computedStyle.maxHeight !== 'none' ||
                                  computedStyle.height !== 'auto';
          } catch (error) {
            // Ignore computed style errors
          }
          
          const hasScrollable = hasScrollableContent || isComputedScrollable;
          
          // Prioritize tables and scrollable content over charts
          if (hasTable && hasScrollable) {
            title = `Data Table ${index + 1} (Complete Data)`;
          } else if (hasTable) {
            title = `Data Table ${index + 1}`;
          } else if (hasChart && hasScrollable) {
            title = `Chart ${index + 1} (with Data)`;
          } else if (hasChart) {
            title = `Chart ${index + 1}`;
          } else if (hasScrollable) {
            title = `Scrollable Content ${index + 1}`;
          }
          
          console.log(`🔍 Inferred title for card ${index}: "${title}" (Table: ${!!hasTable}, Chart: ${!!hasChart}, Scrollable: ${hasScrollable})`);
        }
        
        sections.push({
          id: `card-${index}`,
          title,
          element: cardElement as HTMLElement,
          selected: true
        });
      });
      
      console.log(`✅ Successfully detected ${cardElements.length} card sections`);
    } else {
      console.log('⚠️ No card elements found in regressions container');
    }
  } else {
    console.log('⚠️ No regressions container found within root element');
  }
  
  return sections;
};

/**
 * Check if an element contains meaningful content for printing
 */
export const hasSignificantContent = (element: HTMLElement): boolean => {
  console.log(`🧪 Checking content significance for element: ${element.tagName}.${element.className}`);
  
  // Check for tables first (highest priority for data)
  const tables = element.querySelectorAll('table');
  console.log(`  📊 Found ${tables.length} table elements`);
  
  if (tables.length > 0) {
    // Check if tables have data rows
    let hasDataRows = false;
    let totalRows = 0;
    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr, tr');
      if (rows.length > 0) {
        hasDataRows = true;
        totalRows += rows.length;
        console.log(`  📊 Table has ${rows.length} data rows`);
      }
    });
    
    if (hasDataRows) {
      console.log(`  ✅ Table validation passed with ${totalRows} total rows`);
      return true;
    }
  }
  
  // Check for scrollable content (second priority - often contains hidden data)
  const scrollableElements = element.querySelectorAll('[style*="overflow"], [style*="max-height"], [class*="scroll"], [style*="height"]');
  console.log(`  📜 Found ${scrollableElements.length} potentially scrollable elements`);
  
  if (scrollableElements.length > 0) {
    // Check if scrollable elements contain meaningful content
    let hasScrollableData = false;
    scrollableElements.forEach(scrollEl => {
      const scrollElement = scrollEl as HTMLElement;
      const computedStyle = window.getComputedStyle(scrollElement);
      const isScrollable = computedStyle.overflow === 'auto' || 
                          computedStyle.overflow === 'scroll' || 
                          computedStyle.maxHeight !== 'none' ||
                          computedStyle.height !== 'auto';
      
      if (isScrollable) {
        const hasContent = (scrollElement.textContent?.trim().length || 0) > 50 || 
                          scrollElement.querySelector('table, div, span, p') !== null;
        if (hasContent) {
          hasScrollableData = true;
          const textContent = scrollElement.textContent?.trim() || '';
          console.log(`  📜 Scrollable element has content: ${textContent.substring(0, 100)}...`);
        }
      }
    });
    
    if (hasScrollableData) {
      console.log(`  ✅ Scrollable content validation passed`);
      return true;
    }
  }
  
  // Check for charts/visualizations (enhanced detection)
  const chartSelectors = [
    '[class*="plotly"]',
    '.js-plotly-plot', 
    '[data-unformatted-plot]',
    'svg',
    'canvas',
    '[class*="chart"]',
    '[class*="graph"]'
  ];
  
  let totalCharts = 0;
  chartSelectors.forEach(selector => {
    const elements = element.querySelectorAll(selector);
    totalCharts += elements.length;
  });
  
  console.log(`  📈 Found ${totalCharts} chart/visualization elements`);
  if (totalCharts > 0) {
    // Additional check: make sure charts have some content
    const svgs = element.querySelectorAll('svg');
    const hasValidSvg = Array.from(svgs).some(svg => {
      const svgContent = svg.innerHTML.trim();
      return svgContent.length > 100; // SVG has substantial content
    });
    
    const canvases = element.querySelectorAll('canvas');
    const hasValidCanvas = Array.from(canvases).some(canvas => {
      const canvasEl = canvas as HTMLCanvasElement;
      return canvasEl.width > 50 && canvasEl.height > 50; // Canvas has reasonable dimensions
    });
    
    console.log(`  📈 Chart validation - Valid SVG: ${hasValidSvg}, Valid Canvas: ${hasValidCanvas}`);
    
    if (hasValidSvg || hasValidCanvas || totalCharts > 0) {
      return true;
    }
  }
  
  // Check for significant text content
  const textContent = element.textContent?.trim() || '';
  const hasSignificantText = textContent.length > 100; // Increased threshold for better filtering
  console.log(`  📝 Text content length: ${textContent.length}, significant: ${hasSignificantText}`);
  
  // Check for meaningful child elements
  const meaningfulChildren = element.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6').length;
  const hasStructure = meaningfulChildren > 2;
  console.log(`  🏗️ Meaningful children: ${meaningfulChildren}, has structure: ${hasStructure}`);
  
  const isSignificant = hasSignificantText || hasStructure;
  console.log(`  ✅ Final significance: ${isSignificant}`);
  
  return isSignificant;
};

/**
 * Clean section title for better readability
 */
export const cleanSectionTitle = (title: string): string => {
  return title
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[^\w\s-()[\]]/g, '') // Remove special chars except common ones
    .trim();
};

/**
 * Calculate the depth of an element in the DOM tree
 */
const getElementDepth = (element: HTMLElement): number => {
  let depth = 0;
  let parent = element.parentElement;
  
  while (parent) {
    depth++;
    parent = parent.parentElement;
  }
  
  return depth;
};

/**
 * Check if an element is likely a generic container (vs content)
 */
const isLikelyContainer = (element: HTMLElement): boolean => {
  const className = element.className.toLowerCase();
  const tagName = element.tagName.toLowerCase();
  
  // Skip common container patterns
  const containerPatterns = [
    'app', 'root', 'main', 'body', 'html', 'layout', 'container', 
    'wrapper', 'page', 'content-wrapper', 'app-container'
  ];
  
  return containerPatterns.some(pattern => 
    className.includes(pattern) || tagName === pattern
  ) || element === document.body || element === document.documentElement;
};