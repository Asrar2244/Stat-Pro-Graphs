/**
 * 3D Mesh data processing utilities
 */

import { ProcessedSeries, DataProcessingConfig } from '../common/types';
import { MeshDataConfig } from './types';

/**
 * Process data for 3D mesh plots based on format
 */
export const process3DMeshData = (config: DataProcessingConfig): ProcessedSeries[] => {
  const { graphConfig, rows, xNames, yNames, zNames = [] } = config;
  const series: ProcessedSeries[] = [];

  console.log(`🌐 Processing 3D Mesh Data:`, {
    graphType: graphConfig?.graphType,
    subType: graphConfig?.subType,
    dataFormat: graphConfig.dataFormat,
    xNames,
    yNames,
    zNames,
    rowCount: rows.length,
    fullConfig: graphConfig
  });

  if (graphConfig.dataFormat === 'XYZ Triplets' || graphConfig.dataFormat === 'xyz-columns') {
    // Format 1: XYZ Triplets - 1 X, 1 Y, 1 Z
    if (xNames?.length >= 1 && yNames?.length >= 1 && zNames?.length >= 1) {
      const xCol = xNames[0];
      const yCol = yNames[0];
      const zCol = zNames[0];
      
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      const zv = rows.map((r: any) => Number(r[zCol]));
      
      const label = `${zCol} (Z) vs ${xCol} (X), ${yCol} (Y)`;
      series.push({ xv, yv, zv, label });
      
      console.log(`✅ XYZ Triplets: Created series with ${xv.length} points`, {
        xCol, yCol, zCol,
        sampleX: xv.slice(0, 3),
        sampleY: yv.slice(0, 3),
        sampleZ: zv.slice(0, 3)
      });
    }
  } else if (graphConfig.dataFormat === 'Many Z' || graphConfig.dataFormat === 'z-matrix') {
    // Format 2: Many Z - First Z and Last Z, X and Y are assumed/default scales
    if (zNames?.length >= 2) {
      const firstZCol = zNames[0];
      const lastZCol = zNames[zNames.length - 1];
      
      // Create assumed X and Y scales (default scales)
      const xv = rows.map((_, index) => (index + 1) * 10); // X scale: 10, 20, 30, ...
      const yv = rows.map((_, index) => index + 1);       // Y scale: 1, 2, 3, ...
      
      // Create Z values from first and last Z columns (average or use first)
      const zv = rows.map((r: any) => {
        const firstZ = Number(r[firstZCol]);
        const lastZ = Number(r[lastZCol]);
        return (firstZ + lastZ) / 2; // Average of first and last Z
      });
      
      const label = `${firstZCol}, ${lastZCol} (Z) vs X Scale, Y Scale`;
      series.push({ xv, yv, zv, label });
      
      console.log(`✅ Many Z: Created series with ${xv.length} points`, {
        firstZCol, lastZCol,
        xScale: '10, 20, 30...',
        yScale: '1, 2, 3...',
        sampleX: xv.slice(0, 3),
        sampleY: yv.slice(0, 3),
        sampleZ: zv.slice(0, 3)
      });
    } else if (zNames?.length === 1) {
      // Fallback: Use single Z column with assumed scales
      const zCol = zNames[0];
      const xv = rows.map((_, index) => (index + 1) * 10);
      const yv = rows.map((_, index) => index + 1);
      const zv = rows.map((r: any) => Number(r[zCol]));
      
      const label = `${zCol} (Z) vs X Scale, Y Scale`;
      series.push({ xv, yv, zv, label });
      
      console.log(`✅ Many Z (Single): Created series with ${xv.length} points`, {
        zCol,
        sampleX: xv.slice(0, 3),
        sampleY: yv.slice(0, 3),
        sampleZ: zv.slice(0, 3)
      });
    }
  } else if (graphConfig.dataFormat === 'XY Many Z' || graphConfig.dataFormat === 'xy-z-columns') {
    // Format 3: XY Many Z - 1 X, 1 Y, First Z and Last Z
    if (xNames?.length >= 1 && yNames?.length >= 1 && zNames?.length >= 1) {
      const xCol = xNames[0];
      const yCol = yNames[0];
      
      const xv = rows.map((r: any) => Number(r[xCol]));
      const yv = rows.map((r: any) => Number(r[yCol]));
      
      // Create Z values from first and last Z columns
      let zv: number[];
      let label: string;
      
      if (zNames.length >= 2) {
        // Use first and last Z columns
        const firstZCol = zNames[0];
        const lastZCol = zNames[zNames.length - 1];
        
        zv = rows.map((r: any) => {
          const firstZ = Number(r[firstZCol]);
          const lastZ = Number(r[lastZCol]);
          return (firstZ + lastZ) / 2; // Average of first and last Z
        });
        
        label = `${firstZCol}, ${lastZCol} (Z) vs ${xCol} (X), ${yCol} (Y)`;
        
        console.log(`✅ XY Many Z: Created series with ${xv.length} points`, {
          xCol, yCol, firstZCol, lastZCol,
          sampleX: xv.slice(0, 3),
          sampleY: yv.slice(0, 3),
          sampleZ: zv.slice(0, 3)
        });
      } else {
        // Fallback: Use single Z column
        const zCol = zNames[0];
        zv = rows.map((r: any) => Number(r[zCol]));
        label = `${zCol} (Z) vs ${xCol} (X), ${yCol} (Y)`;
        
        console.log(`✅ XY Many Z (Single): Created series with ${xv.length} points`, {
          xCol, yCol, zCol,
          sampleX: xv.slice(0, 3),
          sampleY: yv.slice(0, 3),
          sampleZ: zv.slice(0, 3)
        });
      }
      
      series.push({ xv, yv, zv, label });
    }
  }

  console.log(`✅ Processed ${series.length} 3D mesh series`);
  return series;
};
