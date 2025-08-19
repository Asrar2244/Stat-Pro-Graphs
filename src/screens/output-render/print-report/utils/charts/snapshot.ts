/**
 * Snapshot charts directly from source output into cloned element
 * - Copies Plotly SVGs and Canvas as data URIs so print matches on-screen
 * - Returns true if any chart was snapshotted
 */
export const snapshotChartsFromOriginal = async (source: HTMLElement, targetClone: HTMLElement): Promise<boolean> => {
  try {
    let snapshotted = false;
    // Handle Plotly SVGs
    const sourcePlotlySvgs = source.querySelectorAll('.js-plotly-plot svg, [class*="plotly"] svg');
    if (sourcePlotlySvgs.length > 0) {
      const clonePlotlyRoots = targetClone.querySelectorAll('.js-plotly-plot, [class*="plotly"]');
      sourcePlotlySvgs.forEach((svg, idx) => {
        const svgEl = svg as SVGElement;
        const svgMarkup = new XMLSerializer().serializeToString(svgEl);
        const img = document.createElement('img');
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '15px 0';
        const container = clonePlotlyRoots[idx] as HTMLElement | undefined;
        if (container && container.parentNode) {
          container.parentNode.replaceChild(img, container);
          snapshotted = true;
        }
      });
    }
    // Handle Canvas charts by rasterizing to PNG
    const sourceCanvases = source.querySelectorAll('canvas');
    if (sourceCanvases.length > 0) {
      const cloneCanvases = targetClone.querySelectorAll('canvas');
      sourceCanvases.forEach((canvas, idx) => {
        const png = (canvas as HTMLCanvasElement).toDataURL('image/png');
        const img = document.createElement('img');
        img.src = png;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '15px 0';
        const cloneCanvas = cloneCanvases[idx] as HTMLCanvasElement | undefined;
        if (cloneCanvas && cloneCanvas.parentNode) {
          cloneCanvas.parentNode.replaceChild(img, cloneCanvas);
          snapshotted = true;
        }
      });
    }
    return snapshotted;
  } catch (e) {
    console.warn('⚠️ Snapshot charts failed, will fallback:', e);
    return false;
  }
};

