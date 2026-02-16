/**
 * Contour Plot trace generation utilities
 */

import { TraceConfig } from '../common/types';
import { COLOR_SCALE_DEFINITIONS } from '../mesh3DProperties';
// interpolateXYZToGrid import removed as we use inline IDW

/**
 * Get properly formatted colorscale for Plotly
 */
const getPlotlyColorScale = (colorScaleName: string): any => {
    if (!colorScaleName) return 'Viridis';

    // Normalize name
    const key = colorScaleName.toLowerCase();

    // Check if it exists in our definitions (which holds array definitions)
    if (COLOR_SCALE_DEFINITIONS[key]) {
        return COLOR_SCALE_DEFINITIONS[key];
    }

    // Fallback: Return capitalized standard name if not in custom definitions
    // But mostly we rely on COLOR_SCALE_DEFINITIONS having everything
    const map: { [key: string]: string } = {
        'viridis': 'Viridis',
        'plasma': 'Plasma',
        'inferno': 'Inferno',
        'magma': 'Magma',
        'cividis': 'Cividis',
        'turbo': 'Turbo',
        'hot': 'Hot',
        'cool': 'Bluered',
        'rainbow': 'Rainbow',
        'jet': 'Jet'
    };

    return map[key] || 'Viridis';
};


/**
 * Validate if the contour data represents a valid 2D surface or a parametric line
 */
const validateContourData = (xv: (number | string)[] | undefined, yv: (number | string)[] | undefined, isMatrix: boolean): string => {
    // 1. Matrix data is always a valid grid by definition
    if (isMatrix) {
        return "Valid Contour Plot";
    }

    if (!xv || !yv || xv.length === 0 || yv.length === 0) {
        return "Contour Plot Not Recommended";
    }

    const n = xv.length;

    // Count unique values to check for grid structure vs linear trajectory
    // Improved Scientific Clustering for Float Tolerance
    const epsilon = 1e-10;
    const isClose = (a: number, b: number) => Math.abs(a - b) < epsilon;

    const uniqueCount = (values: (number | string)[]) => {
        const nums = values.map(v => Number(v)).sort((a, b) => a - b);
        if (nums.length === 0) return 0;
        let count = 1;
        let current = nums[0];
        for (let i = 1; i < nums.length; i++) {
            if (!isClose(nums[i], current)) {
                count++;
                current = nums[i];
            }
        }
        return count;
    };

    const uniqueX = uniqueCount(xv);
    const uniqueY = uniqueCount(yv);

    // A valid grid typically has N = uniqueX * uniqueY (or close to it if sparse)
    // A linear parametric path (one-to-one function) has N ≈ uniqueX and N ≈ uniqueY

    // Ratio checks
    const ratioX = n / uniqueX;
    const ratioY = n / uniqueY;

    // If the ratio is close to 1 (e.g. < 1.2), it means for every X there is mostly only 1 Y (and vice versa)
    // This implies a 1D trajectory in 3D space, NOT a surface.
    if (ratioX < 1.2 || ratioY < 1.2) {
        return "Interpolated Contour Plot (Visualization Only)";
    }

    // Strict grid check:
    // If it was a perfect grid, N should equal uniqueX * uniqueY.
    if (n === uniqueX * uniqueY) {
        return "Valid Contour Plot";
    }

    // Fallback: It's 2D data but not a perfect grid => Interpolated
    return "Interpolated Contour Plot (Visualization Only)";
};

/**
 * Create a 2D Contour trace
 */
export const createContourTrace = (config: TraceConfig): any => {
    const { xv, yv, zv, label, graphConfig } = config;
    const isMatrix = (config as any).isMatrix || false;

    // Validate Data
    const validationResult = validateContourData(xv, yv, isMatrix);


    // Update label to reflect validation status validationResult
    let finalLabel = label;
    if (validationResult.includes("Interpolated")) {
        finalLabel = `${label} (Interpolated)`;
    } else if (validationResult.includes("Not Recommended")) {
        console.warn("[ContourTrace] Contour plot generation not recommended for this dataset.");
    }

    // DEBUG: Log input data for contour trace


    // Extract contour configuration
    // Prioritize live plot properties if available
    const liveContourProps = config.plotProperties?.contour;
    const baseContourConfig = graphConfig.contourConfig || {};

    // Merge: live props > base config > defaults
    const contourConfig = {
        ...baseContourConfig,
        ...(liveContourProps || {})
    };

    const {
        contourType = 'contour', // 'contour' (lines) or 'filled'
        colorScale = 'Viridis',
        showLabels = true,
        opacity = 0.8,
        showGrid = true,
        gridOpacity = 0.5,
        zInterval = undefined
    } = contourConfig;

    const isFilled = contourType === 'filled';

    // Prepare data for contour trace
    let finalX = xv;
    let finalY = yv;
    let finalZ = zv;

    // If data is XYZ Triplets, we likely need to interpolate to a grid for best results,
    // OR Plotly can handle 'contour' type with x, y, z arrays directly if they form a grid.
    // But if they are scattered, we need interpolation.
    // Ideally, reuse the mesh interpolation logic or use Plotly's `type: 'contour'` which expects properties for grid.
    // Actually, Plotly's `contour` trace requires `z` to be a 2D array (Matrix), and `x` and `y` to be 1D arrays (coordinates).
    // It does NOT support XYZ triplets directly like `mesh3d` or `scatter3d` does.

    // So we MUST interpolate XYZ triplets to a grid.

    // Check if we have matrix data (from our data processor)
    let zMatrix: number[][] = [];
    let xCoords: number[] = [];
    let yCoords: number[] = [];


    if (isMatrix && (config as any).z) {
        // Already in matrix format
        zMatrix = (config as any).z;
        xCoords = (config as any).x;
        yCoords = (config as any).y;
    } else if (xv && yv && zv && xv.length > 0) {
        // XYZ Triplets - Check if it forms a grid or needs interpolation
        try {
            // sanitize data
            const validIndices = xv.map((_, i) => i).filter(i =>
                isFinite(Number(xv[i])) && isFinite(Number(yv[i])) && isFinite(Number(zv![i]))
            );

            const cleanX = validIndices.map(i => Number(xv[i]));
            const cleanY = validIndices.map(i => Number(yv[i]));
            const cleanZ = validIndices.map(i => Number(zv![i]));

            if (cleanX.length === 0) return {};

            // Helper for Epsilon-based comparison (Scientific Standard: 1e-10)
            const epsilon = 1e-10;
            const isClose = (a: number, b: number) => Math.abs(a - b) < epsilon;

            // 1. ROBUST GRID DETECTION
            // Cluster X and Y values to find unique axes with tolerance
            const clusterValues = (values: number[]): number[] => {
                const sorted = [...values].sort((a, b) => a - b);
                const unique: number[] = [];
                if (sorted.length === 0) return unique;

                let currentGroupStart = sorted[0];
                let currentGroupSum = sorted[0];
                let currentGroupCount = 1;

                for (let i = 1; i < sorted.length; i++) {
                    if (isClose(sorted[i], currentGroupStart)) {
                        currentGroupSum += sorted[i];
                        currentGroupCount++;
                    } else {
                        unique.push(currentGroupSum / currentGroupCount); // Push average of the group (Snap to grid)
                        currentGroupStart = sorted[i];
                        currentGroupSum = sorted[i];
                        currentGroupCount = 1;
                    }
                }
                unique.push(currentGroupSum / currentGroupCount);
                return unique;
            };

            const uniqueX = clusterValues(cleanX);
            const uniqueY = clusterValues(cleanY);

            const nX = uniqueX.length;
            const nY = uniqueY.length;
            const nTotal = cleanX.length;

            // Grid Topology Check: Does the number of points match the grid size?
            // We allow for "near-grid" matching
            const isPotentialGrid = nTotal === nX * nY;

            if (isPotentialGrid) {
                // Construct Grid by Snapping
                const gridZ: (number | null)[][] = Array(nY).fill(0).map(() => Array(nX).fill(null));

                let filledCount = 0;
                for (let i = 0; i < nTotal; i++) {
                    const x = cleanX[i];
                    const y = cleanY[i];
                    const z = cleanZ[i];

                    // Find closest unique X/Y index
                    // Since unique arrays are sorted, we can use binary search or findIndex
                    // findIndex is fine for typical data sizes < 100k
                    const c = uniqueX.findIndex(ux => isClose(x, ux));
                    const r = uniqueY.findIndex(uy => isClose(y, uy));

                    if (c !== -1 && r !== -1) {
                        gridZ[r][c] = z;
                        filledCount++;
                    }
                }

                if (filledCount === nTotal) {
                    zMatrix = gridZ as number[][];
                    xCoords = uniqueX;
                    yCoords = uniqueY;
                }
            }

            // 2. ADAPTIVE IDW INTERPOLATION
            // If no matrix was formed (scattered data), use IDW
            if (zMatrix.length === 0) {
                let xMin = Math.min(...cleanX);
                let xMax = Math.max(...cleanX);
                let yMin = Math.min(...cleanY);
                let yMax = Math.max(...cleanY);
                const zMinData = Math.min(...cleanZ);
                const zMaxData = Math.max(...cleanZ);

                // Handle degenerate range
                if (Math.abs(xMax - xMin) < epsilon) { xMin -= 0.5; xMax += 0.5; }
                if (Math.abs(yMax - yMin) < epsilon) { yMin -= 0.5; yMax += 0.5; }

                // Adaptive Resolution Calculation
                // Rule: dense data -> high resolution
                const baseRes = Math.sqrt(cleanX.length);
                const calcRes = Math.floor(baseRes * 4);
                // Clamp resolution between 120 (decent visual) and 300 (performance limit)
                // 300x300 = 90,000 pts, feasible for JS
                const resolution = Math.max(120, Math.min(300, calcRes));

                const xStep = (xMax - xMin) / (resolution - 1);
                const yStep = (yMax - yMin) / (resolution - 1);

                xCoords = Array.from({ length: resolution }, (_, i) => xMin + i * xStep);
                yCoords = Array.from({ length: resolution }, (_, i) => yMin + i * yStep);

                // Initialize Z Matrix
                zMatrix = Array(resolution).fill(0).map(() => Array(resolution).fill(null));

                // Scientific IDW Parameters
                const p = 2; // Power parameter (standard inverse square)

                // Search Radius: Derived from data extent
                // Scientific standard often uses a fraction of the diagonal or nearest neighbor distance
                // Let's use 20% of the bounding box diagonal as a "local" search radius
                // This ensures we don't smear data across the entire plot
                const diagonal = Math.sqrt(Math.pow(xMax - xMin, 2) + Math.pow(yMax - yMin, 2));
                const searchRadius = diagonal * 0.25;
                const searchRadiusSq = searchRadius * searchRadius;

                // Minimum Neighbours
                // Avoid extrapolating into empty space with just 1 or 2 points
                const minNeighbours = 3;

                // Pre-calculate points structure
                const points = cleanX.map((x, i) => ({ x, y: cleanY[i], z: cleanZ![i] }));

                // IDW Loop
                for (let r = 0; r < resolution; r++) {
                    const targetY = yMin + r * yStep;
                    for (let c = 0; c < resolution; c++) {
                        const targetX = xMin + c * xStep;

                        let num = 0;
                        let den = 0;
                        let exactMatch = false;
                        let neighbourCount = 0;
                        let exactZ = 0;

                        // Check distances
                        for (let k = 0; k < points.length; k++) {
                            const point = points[k];
                            const dx = point.x - targetX;
                            const dy = point.y - targetY;
                            const distSq = dx * dx + dy * dy;

                            // Exact match (or very close) check
                            if (distSq < epsilon) {
                                exactMatch = true;
                                exactZ = point.z;
                                break;
                            }

                            // Search Radius Check
                            if (distSq <= searchRadiusSq) {
                                const dist = Math.sqrt(distSq);
                                const w = 1 / Math.pow(dist, p);
                                num += w * point.z;
                                den += w;
                                neighbourCount++;
                            }
                        }

                        if (exactMatch) {
                            zMatrix[r][c] = exactZ;
                        } else if (neighbourCount >= minNeighbours && den > 0) {
                            let val = num / den;

                            // Data Integrity: Clamp to min/max of original Z
                            // Prevents artificial overshoots
                            val = Math.max(zMinData, Math.min(zMaxData, val));

                            zMatrix[r][c] = val;
                        } else {
                            zMatrix[r][c] = null; // Blank out areas with insufficient data
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Error gridding contour data", e);
            return {}; // fallback
        }
    }



    // Construct the trace
    const trace = {
        type: 'contour',
        x: xCoords,
        y: yCoords,
        z: zMatrix,
        name: finalLabel,
        colorscale: getPlotlyColorScale(colorScale),
        opacity: opacity,
        showlegend: true,
        visible: true,

        // Contour configuration
        contours: {
            coloring: isFilled ? 'fill' : 'lines',
            showlabels: showLabels,
            labelfont: {
                family: 'Arial',
                size: 11,
                color: (config as any).isDarkTheme ? 'white' : 'black'
            },
            showlines: showGrid, // Control visibility of contour lines
            ...(zInterval !== undefined && zInterval > 0 ? { size: zInterval } : {})
        },

        // Auto-contrast usually good, but can be manual
        // zmin, zmax can be set if needed

        colorbar: {
            title: {
                text: 'Z',
                side: 'right'
            }
        }
    };

    return trace;
};

