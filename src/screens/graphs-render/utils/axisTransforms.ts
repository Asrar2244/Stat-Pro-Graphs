/**
 * Axis transformation utilities
 * Handles mathematical transformations for different scale types
 */

export interface AxisTransformConfig {
  value: number;
  scale?: string;
}

export interface TransformArrayConfig {
  array: number[];
  scale?: string;
}

/**
 * Clamp a value between min and max
 */
export const clamp = (v: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, v));
};

/**
 * Acklam's approximation for inverse normal CDF (probit)
 * Reference: https://web.archive.org/web/20150910044740/http://home.online.no/~pjacklam/notes/invnorm/
 */
export const invNormApprox = (p: number): number => {
  const probEps = 1e-12;
  const a1 = -3.969683028665376e+01;
  const a2 = 2.209460984245205e+02;
  const a3 = -2.759285104469687e+02;
  const a4 = 1.383577518672690e+02;
  const a5 = -3.066479806614716e+01;
  const a6 = 2.506628277459239e+00;
  const b1 = -5.447609879822406e+01;
  const b2 = 1.615858368580409e+02;
  const b3 = -1.556989798598866e+02;
  const b4 = 6.680131188771972e+01;
  const b5 = -1.328068155288572e+01;
  const c1 = -7.784894002430293e-03;
  const c2 = -3.223964580411365e-01;
  const c3 = -2.400758277161838e+00;
  const c4 = -2.549732539343734e+00;
  const c5 = 4.374664141464968e+00;
  const c6 = 2.938163982698783e+00;
  const d1 = 7.784695709041462e-03;
  const d2 = 3.224671290700398e-01;
  const d3 = 2.445134137142996e+00;
  const d4 = 3.754408661907416e+00;
  const plow = 0.02425;
  const phigh = 1 - plow;

  let q: number, r: number;

  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  if (phigh < p) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  q = p - 0.5;
  r = q * q;
  return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
};

/**
 * Transform a single axis value based on scale type
 */
export const transformAxisValue = (config: AxisTransformConfig): number => {
  const { value, scale } = config;

  if (value == null || Number.isNaN(value)) {
    return value as any;
  }

  const probEps = 1e-12;

  switch (scale) {
    case 'reciprocal': {
      return value === 0 ? NaN : 1 / value;
    }
    case 'logit': {
      const p = clamp(value, probEps, 1 - probEps);
      return Math.log(p / (1 - p));
    }
    case 'probit': {
      const p = clamp(value, probEps, 1 - probEps);
      return invNormApprox(p);
    }
    case 'weibull': {
      // y = ln(-ln(1 - p)) on a Weibull probability plot
      const p = clamp(value, probEps, 1 - probEps);
      return Math.log(-Math.log(1 - p));
    }
    case 'probability':
    default:
      return value;
  }
};

/**
 * Transform an array of values based on scale type
 */
export const transformArrayForScale = (config: TransformArrayConfig): number[] => {
  const { array, scale } = config;

  if (!Array.isArray(array)) {
    return array;
  }

  return array.map((v) => transformAxisValue({ value: v as any, scale }));
};

/**
 * Get axis type for Plotly based on scale type
 */
export const getAxisType = (scaleType?: string): string => {
  switch (scaleType) {
    case 'linear': return 'linear';
    case 'log10': return 'log';
    case 'loge': return 'log';
    case 'category': return 'category';
    case 'datetime': return 'date';
    // Probability/probit/logit/weibull/reciprocal would require transforms; default to linear for now
    default: return 'linear';
  }
};
