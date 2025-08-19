import type { IPrintSection } from '../types';

/**
 * Detect printable sections from the DOM
 */
export const detectPrintableSections = (): IPrintSection[] => {
  console.log('🔍 Starting section detection...');
  
  const sections: IPrintSection[] = [];
  
  // Strategy 1: Look for the main regressions layout container first
  // This contains all the CardTableRender and GraphPlot components
  let regressionsContainer = document.querySelector('[class*="regressionsLayout"]');
  
  if (!regressionsContainer) {
    // Try alternative container patterns
    const alternativeSelectors = [
      'div[class*="regression"]',
      'div[class*="Regression"]',
      'div[class*="layout"]',
      'div[class*="Layout"]'
    ];
    
    for (const selector of alternativeSelectors) {
      regressionsContainer = document.querySelector(selector);
      if (regressionsContainer) {
        console.log(`📍 Found alternative container using: ${selector}`);
        console.log(`📍 Container classes: ${(regressionsContainer as HTMLElement).className}`);
        break;
      }
    }
  } else {
    console.log('📍 Found regressions layout container');
    console.log(`📍 Container classes: ${(regressionsContainer as HTMLElement).className}`);
  }
  
  if (regressionsContainer) {
    // Strategy 2: Find FluentUI Card components within the regressions layout
    const cardElements = regressionsContainer.querySelectorAll('.fui-Card');
    
    console.log(`🔍 Looking for cards in container with ${regressionsContainer.children.length} children`);
    console.log(`🔍 Container HTML preview: ${regressionsContainer.innerHTML.substring(0, 200)}...`);
    
    if (cardElements.length > 0) {
      console.log(`📋 Found ${cardElements.length} FluentUI Card sections`);
      
      cardElements.forEach((cardElement, index) => {
        // Skip nested cards (child cards within parent cards)
        const isNestedCard = cardElement.closest('.fui-Card') !== cardElement;
        if (isNestedCard) {
          console.log(`⏭️ Skipping nested card at index ${index}`);
          return;
        }
        
        // Extract title from CardHeader
        let title = `Section ${index + 1}`;
        
        const cardHeader = cardElement.querySelector('.fui-CardHeader');
        if (cardHeader) {
          // Look for Body1Stronger element which contains the title
          const titleElement = cardHeader.querySelector('.fui-Body1Stronger');
          if (titleElement?.textContent?.trim()) {
            title = titleElement.textContent.trim();
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
      
      console.log(`✅ Successfully detected ${sections.length} card sections`);
      return sections;
    }
  }
  
  // Fallback Strategy: Search the entire document for any output containers
  console.log('⚠️ No regressions layout found, trying fallback detection...');
  
  const fallbackContainers = [
    '[class*="outputContainer"]', 
    '[class*="content"]',
    '[class*="selectionLayout"]',
    '[data-testid*="output"]'
  ];
  
  let mainContainer: Element | null = null;
  
  for (const selector of fallbackContainers) {
    const container = document.querySelector(selector);
    if (container) {
      console.log(`📍 Found fallback container using selector: ${selector}`);
      mainContainer = container;
      break;
    }
  }
  
  if (!mainContainer) {
    console.log('⚠️ No container found, searching entire document');
    mainContainer = document.body;
  }
  
  // Look for any FluentUI Cards in the fallback container
  const allCards = mainContainer.querySelectorAll('.fui-Card');
  
  if (allCards.length > 0) {
    console.log(`📋 Found ${allCards.length} cards in fallback search`);
    
    allCards.forEach((cardElement, index) => {
      // Skip nested cards
      const parentCard = cardElement.parentElement?.closest('.fui-Card');
      if (parentCard && parentCard !== cardElement) {
        console.log(`⏭️ Skipping nested card at index ${index}`);
        return;
      }
      
      // Extract title
      let title = `Section ${index + 1}`;
      const cardHeader = cardElement.querySelector('.fui-CardHeader .fui-Body1Stronger');
      if (cardHeader?.textContent?.trim()) {
        title = cardHeader.textContent.trim();
      }
      
      sections.push({
        id: `fallback-card-${index}`,
        title,
        element: cardElement as HTMLElement,
        selected: true
      });
    });
  }
  
  // Final fallback: Look for standalone tables and charts if no cards found
  if (sections.length === 0) {
    console.log('⚠️ No card sections found, looking for standalone elements');
    
    // Search in the best available container
    const searchContainer = mainContainer || document.body;
    console.log(`🔍 Searching in container: ${searchContainer.tagName} with ${searchContainer.children.length} children`);
    
    const tables = searchContainer.querySelectorAll('table');
    const charts = searchContainer.querySelectorAll(
      '[class*="plotly"], .js-plotly-plot, [data-unformatted-plot], svg, canvas, [class*="chart"]'
    );
    
    console.log(`🔍 Found ${tables.length} tables and ${charts.length} charts in search container`);
    
    if (tables.length > 0) {
      console.log(`📊 Processing ${tables.length} standalone tables`);
      tables.forEach((table, index) => {
        // Get the closest parent that might contain title information
        const tableParent = table.closest('div, section, article') || table.parentElement;
        let title = `Data Table ${index + 1}`;
        
        // Try to find a title in the parent elements
        if (tableParent) {
          const titleElement = tableParent.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="header"]');
          if (titleElement?.textContent?.trim()) {
            title = titleElement.textContent.trim();
          }
        }
        
        console.log(`📊 Adding table section: "${title}"`);
        sections.push({
          id: `table-${index}`,
          title,
          element: table as HTMLElement,
          selected: true
        });
      });
    }
    
    if (charts.length > 0) {
      console.log(`📈 Processing ${charts.length} standalone charts`);
      charts.forEach((chart, index) => {
        // Get the closest parent that might contain title information
        const chartParent = chart.closest('div, section, article') || chart.parentElement;
        let title = `Chart ${index + 1}`;
        
        // Try to find a title in the parent elements
        if (chartParent) {
          const titleElement = chartParent.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="header"]');
          if (titleElement?.textContent?.trim()) {
            title = titleElement.textContent.trim();
          }
        }
        
        console.log(`📈 Adding chart section: "${title}"`);
        sections.push({
          id: `chart-${index}`,
          title,
          element: chart as HTMLElement,
          selected: true
        });
      });
    }
    
    // If still no sections, try a very broad search for any content containers
    if (sections.length === 0) {
      console.log('🚨 Still no sections found, trying broad content search...');
      
      const contentDivs = document.querySelectorAll('div');
      console.log(`🔍 Found ${contentDivs.length} total divs in document`);
      
      // Look for divs that contain meaningful content (tables, significant text, etc.)
      const meaningfulDivs: HTMLElement[] = [];
      
      contentDivs.forEach((div) => {
        const htmlDiv = div as HTMLElement;
        const hasTable = htmlDiv.querySelector('table');
        const hasChart = htmlDiv.querySelector('svg, canvas');
        const textLength = htmlDiv.textContent?.trim().length || 0;
        
        // Consider div meaningful if it has a table, chart, or substantial text content
        if (hasTable || hasChart || textLength > 100) {
          // But skip if it's too nested or likely a container
          const depth = getElementDepth(htmlDiv);
          if (depth < 10 && !isLikelyContainer(htmlDiv)) {
            meaningfulDivs.push(htmlDiv);
          }
        }
      });
      
      console.log(`🔍 Found ${meaningfulDivs.length} potentially meaningful content divs`);
      
      meaningfulDivs.slice(0, 10).forEach((div, index) => { // Limit to first 10 to avoid spam
        console.log(`📄 Adding content section: "Content ${index + 1}"`);
        sections.push({
          id: `content-${index}`,
          title: `Content ${index + 1}`,
          element: div,
          selected: true
        });
      });
    }
  }
  
  console.log(`✅ Final result: detected ${sections.length} printable sections`);
  sections.forEach((section, index) => {
    console.log(`  ${index + 1}. ${section.title} (${section.id})`);
  });
  
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