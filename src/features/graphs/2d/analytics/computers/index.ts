import { AnalyticsComputer } from './types';
import { ROCCurveComputer } from './ROCCurve';

export * from './types';

export const availableComputers: AnalyticsComputer[] = [
    ROCCurveComputer,
    // Add other computers here as they are implemented
    // QQPlotComputer,
    // FeatureImportanceComputer
];

export const getComputer = (type: string): AnalyticsComputer | undefined => {
    return availableComputers.find(c => c.type === type);
};
