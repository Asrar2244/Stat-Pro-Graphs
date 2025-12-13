import type { IPrintSection } from '../types';
import {
  DATA_OUTPUT_ID_ATTR,
  PRIMARY_LAYOUT_SELECTOR,
  ALTERNATIVE_LAYOUT_SELECTORS,
  PRINTABLE_CARD_SELECTOR,
  PRINTABLE_TABLE_SELECTOR,
  PRINTABLE_CHART_SELECTOR,
} from './constants';

const SCROLLABLE_SELECTOR =
  '[style*="overflow"], [style*="max-height"], [class*="scroll"], [style*="height"]';

const hasContent = (element: Element | null): boolean => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  return (element.textContent?.trim().length || 0) > 50 || element.querySelector('table, div, span, p') !== null;
};

const isScrollableElement = (element: HTMLElement): boolean => {
  const computedStyle = window.getComputedStyle(element);
  return (
    computedStyle.overflow === 'auto' ||
    computedStyle.overflow === 'scroll' ||
    computedStyle.maxHeight !== 'none' ||
    computedStyle.height !== 'auto'
  );
};

/**
 * Detect printable sections from the DOM
 */
export const detectPrintableSections = (root?: HTMLElement): IPrintSection[] => {
  if (!root) {
    return [];
  }

  const outputId = root.getAttribute(DATA_OUTPUT_ID_ATTR);
  if (!outputId) {
    return [];
  }

  let regressionsContainer: Element | null = root.querySelector(PRIMARY_LAYOUT_SELECTOR);

  if (!regressionsContainer) {
    for (const selector of ALTERNATIVE_LAYOUT_SELECTORS) {
      try {
        regressionsContainer = root.querySelector(selector);
      } catch {
        regressionsContainer = null;
      }
      if (regressionsContainer) {
        break;
      }
    }
  }

  if (!regressionsContainer) {
    const cardsInRoot = root.querySelectorAll(PRINTABLE_CARD_SELECTOR);
    if (cardsInRoot.length > 0) {
      regressionsContainer = root;
    }
  }

  const sections: IPrintSection[] = [];

  // Check for sample size output (textarea/notepad type)
  // Look for container with notepadContainer class or any textarea in the output
  const notepadContainer = root.querySelector('[class*="notepadContainer"]') as HTMLElement | null;
  const sampleSizeTextarea = notepadContainer 
    ? notepadContainer.querySelector('textarea') as HTMLTextAreaElement | null
    : root.querySelector('textarea') as HTMLTextAreaElement | null;
  
  if (sampleSizeTextarea) {
    const textareaValue = sampleSizeTextarea.value || sampleSizeTextarea.textContent || '';
    if (textareaValue.trim().length > 0) {
      const containerElement = notepadContainer || 
                               sampleSizeTextarea.parentElement as HTMLElement || 
                               root;
      sections.push({
        id: 'sample-size-output',
        title: 'Sample Size Report',
        element: containerElement,
        selected: true,
      });
    }
  }

  if (!regressionsContainer) {
    // If we found sample size output, return it even if no cards found
    if (sections.length > 0) {
      return sections;
    }
    return [];
  }

  const cardElements = regressionsContainer.querySelectorAll(PRINTABLE_CARD_SELECTOR);
  if (cardElements.length === 0) {
    // If we found sample size output, return it even if no cards found
    if (sections.length > 0) {
      return sections;
    }
    return [];
  }

  cardElements.forEach((cardElement, index) => {
    const parentCard = (cardElement as HTMLElement).closest(PRINTABLE_CARD_SELECTOR);
    if (parentCard && parentCard !== cardElement) {
      return;
    }

    let title = `Section ${index + 1}`;
    const headerElement = cardElement.querySelector(
      '[class*="CardHeader"], [class*="header"], h1, h2, h3, h4, h5, h6'
    );

    if (headerElement) {
      const headerText = headerElement.textContent?.trim();
      if (headerText) {
        title = headerText;
      }
    }

    if (title.startsWith('Section ')) {
      const hasTable = cardElement.querySelector(PRINTABLE_TABLE_SELECTOR);
      const hasChart = cardElement.querySelector(PRINTABLE_CHART_SELECTOR);
      const hasScrollableContent = cardElement.querySelector(SCROLLABLE_SELECTOR);

      let isComputedScrollable = false;
      try {
        isComputedScrollable = isScrollableElement(cardElement as HTMLElement);
      } catch {
        isComputedScrollable = false;
      }

      const hasScrollable = hasScrollableContent || isComputedScrollable;

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
    }

    sections.push({
      id: `card-${index}`,
      title,
      element: cardElement as HTMLElement,
      selected: true,
    });
  });

  return sections;
};

/**
 * Check if an element contains meaningful content for printing
 */
export const hasSignificantContent = (element: HTMLElement): boolean => {
  const tables = element.querySelectorAll(PRINTABLE_TABLE_SELECTOR);

  if (tables.length > 0) {
    const hasDataRows = Array.from(tables).some((table) => {
      const rows = table.querySelectorAll('tbody tr, tr');
      return rows.length > 0;
    });

    if (hasDataRows) {
      return true;
    }
  }

  const scrollableElements = element.querySelectorAll(SCROLLABLE_SELECTOR);
  if (scrollableElements.length > 0) {
    const hasScrollableData = Array.from(scrollableElements).some((scrollEl) => {
      const scrollElement = scrollEl as HTMLElement;
      if (!isScrollableElement(scrollElement)) {
        return false;
      }
      return hasContent(scrollElement);
    });

    if (hasScrollableData) {
      return true;
    }
  }

  const chartElements = element.querySelectorAll(PRINTABLE_CHART_SELECTOR);
  if (chartElements.length > 0) {
    const hasValidSvg = Array.from(element.querySelectorAll('svg')).some(
      (svg) => (svg as SVGElement).innerHTML.length > 50
    );

    const hasValidCanvas = Array.from(element.querySelectorAll('canvas')).some((canvas) => {
      const canvasElement = canvas as HTMLCanvasElement;
      return canvasElement.width > 10 && canvasElement.height > 10;
    });

    if (hasValidSvg || hasValidCanvas) {
      return true;
    }
  }

  const textContent = element.textContent?.trim() || '';
  const hasSignificantText = textContent.length > 100;

  const meaningfulChildren = Array.from(element.children).filter((child) => {
    if (child instanceof HTMLElement) {
      return child.children.length > 0 || (child.textContent?.trim().length || 0) > 50;
    }
    return false;
  }).length;

  const hasStructure = meaningfulChildren > 2;

  return hasSignificantText || hasStructure;
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
