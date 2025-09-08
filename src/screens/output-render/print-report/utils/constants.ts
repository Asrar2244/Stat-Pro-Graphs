export const PRINT_DEBUG = false;

// Data attributes and selectors used across print-report
export const DATA_OUTPUT_ID_ATTR = 'data-output-id';
export const OUTPUT_ROOT_SELECTOR = '[data-output-root="true"]';

// Container discovery within an output root
export const PRIMARY_LAYOUT_SELECTOR = '[class*="regressionsLayout"]';
export const ALTERNATIVE_LAYOUT_SELECTORS: string[] = [
  'div[class*="regression"]',
  'div[class*="Regression"]',
  'div[class*="layout"]',
  'div[class*="Layout"]',
];

// Signals of content we consider printable
export const PRINTABLE_CARD_SELECTOR = '.fui-Card';
export const PRINTABLE_TABLE_SELECTOR = 'table';
export const PRINTABLE_CHART_SELECTOR = 'svg, canvas';




