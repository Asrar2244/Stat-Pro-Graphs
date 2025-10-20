/**
 * 3D Mesh interpolation utilities
 */

import { MeshInterpolationConfig } from './types';

/**
 * Raw data interpolation that preserves ALL natural variations
 * Uses the closest data point directly to maintain sharp features
 */
export const rawDataInterpolation = (config: MeshInterpolationConfig): number => {
  const { xv, yv, zv, targetX, targetY } = config;
  
  // Find the single closest data point to preserve raw variations
  let closestDistance = Infinity;
  let closestZ = 0;
  
  for (let i = 0; i < xv.length; i++) {
    const distance = Math.sqrt(Math.pow(xv[i] - targetX, 2) + Math.pow(yv[i] - targetY, 2));
    if (distance < closestDistance) {
      closestDistance = distance;
      closestZ = zv[i];
    }
  }
  
  return closestZ;
};

/**
 * Natural interpolation that preserves data variations and shows bumps/deeps
 * Uses fewer points and less smoothing to maintain natural surface features
 */
export const naturalInterpolation = (config: MeshInterpolationConfig): number => {
  const { xv, yv, zv, targetX, targetY } = config;
  
  // Find the 2 closest points (instead of 4) to preserve more natural variations
  const distances = xv.map((x, i) => ({
    distance: Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(yv[i] - targetY, 2)),
    z: zv[i]
  }));
  
  // Sort by distance and take only the 2 closest points
  distances.sort((a, b) => a.distance - b.distance);
  const closestPoints = distances.slice(0, 2);
  
  if (closestPoints.length === 0) {
    return 0;
  }
  
  if (closestPoints[0].distance < 0.001) {
    return closestPoints[0].z; // Exact match
  }
  
  if (closestPoints.length === 1) {
    return closestPoints[0].z;
  }
  
  // Use linear interpolation between the 2 closest points to preserve variations
  const d1 = closestPoints[0].distance;
  const d2 = closestPoints[1].distance;
  const z1 = closestPoints[0].z;
  const z2 = closestPoints[1].z;
  
  // Linear interpolation that preserves natural variations
  if (d1 + d2 === 0) return z1;
  return (z1 * d2 + z2 * d1) / (d1 + d2);
};

/**
 * Data-driven interpolation that respects actual data points
 * Uses natural interpolation based on nearby data points only
 */
export const akimaInterpolation = (config: MeshInterpolationConfig): number => {
  const { xv, yv, zv, targetX, targetY } = config;
  
  // Fast interpolation using only the 4 closest points for speed
  const distances = xv.map((x, i) => ({
    distance: Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(yv[i] - targetY, 2)),
    z: zv[i]
  }));
  
  // Sort by distance and take only the 4 closest points
  distances.sort((a, b) => a.distance - b.distance);
  const closestPoints = distances.slice(0, 4);
  
  if (closestPoints.length === 0) {
    return 0;
  }
  
  if (closestPoints[0].distance < 0.001) {
    return closestPoints[0].z; // Exact match
  }
  
  if (closestPoints.length === 1) {
    return closestPoints[0].z;
  }
  
  // Fast inverse distance weighting with only 4 points
  let weightedSum = 0;
  let weightSum = 0;
  
  for (const point of closestPoints) {
    const weight = 1 / Math.pow(point.distance, 1.5); // Reduced power for speed
    weightedSum += point.z * weight;
    weightSum += weight;
  }
  
  return weightSum > 0 ? weightedSum / weightSum : closestPoints[0].z;
};
