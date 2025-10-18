/**
 * Custom hook for graph data processing
 * Handles database queries, data processing, and quality assessment
 */

import { useEffect, useState, useCallback } from 'react';
import { Database } from '@utils';
import { EXCEL } from '@constants';
import { processDataByFormat } from '../utils/dataProcessing';
import { assessDataQuality } from '../utils/common';
import { plotWithCategory } from '../utils/categoryScatterPlot';

export interface UseGraphDataProps {
  graphConfig: any;
  workspacePath?: string;
  liveProps?: any;
}

export interface UseGraphDataReturn {
  processedSeries: any[];
  legendLabels: string[];
  categoryPlotResult: any;
  rows: any[];
  xNames: string[];
  yNames: string[];
  zNames: string[];
  categoryNames: string[];
  isLoading: boolean;
  error: string | null;
}

export const useGraphData = ({ graphConfig, workspacePath, liveProps }: UseGraphDataProps): UseGraphDataReturn => {
  const [processedSeries, setProcessedSeries] = useState<any[]>([]);
  const [legendLabels, setLegendLabels] = useState<string[]>([]);
  const [categoryPlotResult, setCategoryPlotResult] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [xNames, setXNames] = useState<string[]>([]);
  const [yNames, setYNames] = useState<string[]>([]);
  const [zNames, setZNames] = useState<string[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processGraphData = useCallback(async () => {
    if (!graphConfig?.selectedProject || !graphConfig?.variables) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Database connection and data loading
      const db = new Database(workspacePath || graphConfig.selectedProject);
      const cols = [...(graphConfig.variables?.x || []), ...(graphConfig.variables?.y || []), ...(graphConfig.variables?.z || []), ...(graphConfig.variables?.category || [])];
      
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
        setIsLoading(false);
        return;
      }

      const colList = cols.map((c: string) => `"${c}"`).join(',');
      const fetchedRows = await db.selectQuery(`SELECT ${colList} FROM ${EXCEL};`);

      // Selected columns by role
      const xNamesArray = (graphConfig.variables?.x as string[]) || [];
      const yNamesArray = (graphConfig.variables?.y as string[]) || [];
      const zNamesArray = (graphConfig.variables?.z as string[]) || [];
      const categoryNamesArray = (graphConfig.variables?.category as string[]) || [];

      // Process data based on format (normalize Single X/Y to axis-anchored formats when both sides are provided)
      let normalizedFormat = graphConfig?.dataFormat;
      
      // Special handling for bidirectional asymmetric error bars - use XY Pairs format
      const isBidirectionalAsymmetricErrorBar = graphConfig?.subType?.toLowerCase().includes('bidirectional') && 
                                               graphConfig?.subType?.toLowerCase().includes('asymmetric') &&
                                               graphConfig?.subType?.toLowerCase().includes('error bar');
      
      if (isBidirectionalAsymmetricErrorBar) {
        normalizedFormat = 'XY Pairs';
        console.log('🔍 Bidirectional Asymmetric Error Bar detected - using XY Pairs format');
      }
      
      // If Single X with both X and Y present → behave as X Many Y
      if (normalizedFormat === 'Single X' && xNamesArray?.length > 0 && yNamesArray?.length > 0) {
        normalizedFormat = 'X Many Y';
      } else if (normalizedFormat === 'Single Y' && xNamesArray?.length > 0 && yNamesArray?.length > 0) {
        normalizedFormat = 'Y Many X';
      }
      
      // Respect whichever variables the user passed:
      // - If Single X but only Y provided → treat as Single Y (plot Y vs index)
      // - If Single Y but only X provided → treat as Single X (plot X vs index)
      if (normalizedFormat === 'Single X' && (!xNamesArray || xNamesArray.length === 0) && (yNamesArray && yNamesArray.length > 0)) {
        normalizedFormat = 'Single Y';
      } else if (normalizedFormat === 'Single Y' && (!yNamesArray || yNamesArray.length === 0) && (xNamesArray && xNamesArray.length > 0)) {
        normalizedFormat = 'Single X';
      }

      // Process data using the modular data processing
      const processed = processDataByFormat({
        graphConfig: { ...graphConfig, dataFormat: normalizedFormat },
        rows: fetchedRows,
        xNames: xNamesArray,
        yNames: yNamesArray,
        zNames: zNamesArray,
        categoryNames: categoryNamesArray
      });

      // Collect legend labels for editing
      const labels = processed.map(s => s.label);
      
      // Store legend labels in the graph config for the properties panel
      if (labels.length > 0) {
        graphConfig.legendLabels = labels;
        
        // Save legend labels back to the database
        try {
          const { updateGraphRunConfig } = await import('@backend/graphs');
          const currentRunId = graphConfig.runId || graphConfig.id;
          if (currentRunId) {
            await updateGraphRunConfig(workspacePath, currentRunId, { 
              graphConfig: { ...graphConfig, legendLabels: labels } 
            });
          }
        } catch (error) {
          console.warn('Failed to save legend labels:', error);
        }
      }

      // Assess data quality and provide recommendations
      processed.forEach(({ xv, yv, label }) => {
        const qualityReport = assessDataQuality(xv, yv, {
          outlierMethod: 'iqr',
          outlierThreshold: 1.5,
          missingValueThreshold: 0.1,
          minSampleSize: 3
        });
        
        if (!qualityReport.isValid) {
          // Data quality issues detected - handled silently
        }
      });

      // Check if this is a category-based plot and handle differently
      const isCategoryPlot = categoryNamesArray && categoryNamesArray.length > 0;
      const isCategoryFormat = normalizedFormat?.toLowerCase().includes('category');
      let categoryResult: any = null;
      
      if (isCategoryPlot && isCategoryFormat) {
        // For XY Category format, use the specialized category plot utility
        if (normalizedFormat === 'XY Category') {
          categoryResult = plotWithCategory({
            rows: fetchedRows,
            xCol: xNamesArray?.[0],
            yCol: yNamesArray?.[0],
            categoryCol: categoryNamesArray?.[0],
            subType: graphConfig?.subType || 'Scatter Plot',
            liveProps
          });
        }
      }

      // Update state
      setProcessedSeries(processed);
      setLegendLabels(labels);
      setCategoryPlotResult(categoryResult);
      setRows(fetchedRows);
      setXNames(xNamesArray);
      setYNames(yNamesArray);
      setZNames(zNamesArray);
      setCategoryNames(categoryNamesArray);

    } catch (err) {
      console.error('Error processing graph data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [graphConfig, workspacePath, liveProps]);

  useEffect(() => {
    processGraphData();
  }, [processGraphData]);

  return {
    processedSeries,
    legendLabels,
    categoryPlotResult,
    rows,
    xNames,
    yNames,
    zNames,
    categoryNames,
    isLoading,
    error
  };
};
