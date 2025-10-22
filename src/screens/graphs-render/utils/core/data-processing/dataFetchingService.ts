/**
 * Data Fetching Service
 * Handles fetching data from database and processing column names
 */

import { Database } from '@utils';
import { EXCEL } from '@constants';

export interface FetchDataConfig {
  graphConfig: any;
  workspacePath?: string;
}

export interface FetchDataResult {
  rows: any[];
  xNames: string[];
  yNames: string[];
  zNames: string[];
  categoryNames: string[];
  normalizedFormat: string;
}

/**
 * Fetch graph data from database
 */
export const fetchGraphData = async (config: FetchDataConfig): Promise<FetchDataResult> => {
  const { graphConfig, workspacePath } = config;

  if (!graphConfig?.selectedProject || !graphConfig?.variables) {
    throw new Error('Invalid graph configuration');
  }

  const db = new Database(workspacePath || graphConfig.selectedProject);
  const cols = [
    ...(graphConfig.variables?.x || []),
    ...(graphConfig.variables?.y || []),
    ...(graphConfig.variables?.z || []),
    ...(graphConfig.variables?.category || [])
  ];

  // Add error bar variables if needed
  const errorBarVars = graphConfig.variables?.errorBar || [];
  errorBarVars.forEach((errorBarVar: string) => {
    if (!cols.includes(errorBarVar)) {
      cols.push(errorBarVar);
    }
  });

  // Legacy support: add single errorBarVariable if it exists and not already added
  if (graphConfig?.errorBarVariable && !cols.includes(graphConfig.errorBarVariable)) {
    cols.push(graphConfig.errorBarVariable);
  }

  if (cols.length === 0) {
    throw new Error('No columns selected');
  }

  const colList = cols.map((c: string) => `"${c}"`).join(',');
  if (!colList.trim()) {
    throw new Error('Empty column list');
  }

  const rows = await db.selectQuery(`SELECT ${colList} FROM ${EXCEL};`);

  // Selected columns by role
  const xNames = (graphConfig.variables?.x as string[]) || [];
  const yNames = (graphConfig.variables?.y as string[]) || [];
  const zNames = (graphConfig.variables?.z as string[]) || [];
  const categoryNames = (graphConfig.variables?.category as string[]) || [];

  // Process data based on format (normalize Single X/Y to axis-anchored formats when both sides are provided)
  let normalizedFormat = graphConfig?.dataFormat;

  // Special handling for bidirectional asymmetric error bars - use XY Pairs format
  const isBidirectionalAsymmetricErrorBar =
    graphConfig?.subType?.toLowerCase().includes('bidirectional') &&
    graphConfig?.subType?.toLowerCase().includes('asymmetric') &&
    graphConfig?.subType?.toLowerCase().includes('error bar');

  if (isBidirectionalAsymmetricErrorBar) {
    normalizedFormat = 'XY Pairs';
    }

  // If Single X with both X and Y present → behave as X Many Y
  if (normalizedFormat === 'Single X' && xNames?.length > 0 && yNames?.length > 0) {
    normalizedFormat = 'X Many Y';
  } else if (normalizedFormat === 'Single Y' && xNames?.length > 0 && yNames?.length > 0) {
    normalizedFormat = 'Y Many X';
  }

  // Respect whichever variables the user passed:
  // - If Single X but only Y provided → treat as Single Y (plot Y vs index)
  // - If Single Y but only X provided → treat as Single X (plot X vs index)
  if (
    normalizedFormat === 'Single X' &&
    (!xNames || xNames.length === 0) &&
    yNames &&
    yNames.length > 0
  ) {
    normalizedFormat = 'Single Y';
  } else if (
    normalizedFormat === 'Single Y' &&
    (!yNames || yNames.length === 0) &&
    xNames &&
    xNames.length > 0
  ) {
    normalizedFormat = 'Single X';
  }

  return {
    rows,
    xNames,
    yNames,
    zNames,
    categoryNames,
    normalizedFormat
  };
};

