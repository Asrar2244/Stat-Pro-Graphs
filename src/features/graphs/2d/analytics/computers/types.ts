import { PlotType } from '../../../../../screens/graphs-render/utils/common/types';

export type AnalyticsType =
    | 'ROC_CURVE'
    | 'QQ_PLOT'
    | 'KS_PLOT'
    | 'FEATURE_IMPORTANCE'
    | 'ELBOW_CURVE'
    | 'PRECISION_RECALL';

export interface AnalyticsVariableRequirement {
    id: string;
    label: string;
    description?: string;
    type: 'numeric' | 'categorical' | 'any';
    minCount: number;
    maxCount?: number; // undefined means unlimited
}

export interface AnalyticsComputer {
    type: AnalyticsType;
    displayName: string;
    description: string;
    variableRequirements: AnalyticsVariableRequirement[] | ((config: Record<string, any>) => AnalyticsVariableRequirement[]);

    // Validates if the selected variables meet requirements
    validate(variables: Record<string, string[]>): { isValid: boolean; error?: string };

    // Computes the plot configuration from raw data
    compute(data: any[], variables: Record<string, string[]>, options?: any): AnalyticsPlotConfig;
}

export interface AnalyticsPlotConfig {
    plotType: 'scatter' | 'line' | 'bar'; // Maps to existing primitives
    subType?: string;
    data: any; // Plotly specific data or internal format
    layout?: any;
    referenceLines?: ReferenceLine[];
    annotations?: Annotation[];
}

export interface ReferenceLine {
    type: 'diagonal' | 'horizontal' | 'vertical' | 'function';
    value?: number; // for h/v
    slope?: number; // for diagonal/function
    intercept?: number; // for diagonal/function
    from?: [number, number]; // [x, y]
    to?: [number, number]; // [x, y]
    label?: string;
    color?: string;
    dash?: string;
}

export interface Annotation {
    x: number | string;
    y: number | string;
    text: string;
    showarrow?: boolean;
    xanchor?: 'auto' | 'left' | 'center' | 'right';
    yanchor?: 'auto' | 'top' | 'middle' | 'bottom';
    xref?: 'paper' | 'x';
    yref?: 'paper' | 'y';
    font?: {
        size?: number;
        color?: string;
        family?: string;
        weight?: string | number;
    };
    bgcolor?: string;
    bordercolor?: string;
    borderwidth?: number;
    borderpad?: number;
}
