import { AnalyticsComputer } from './types';
import { ROCCurveComputer } from './ROCCurve';
import { KSPlotComputer } from './KSPlot';

export * from './types';

export const availableComputers: AnalyticsComputer[] = [
    ROCCurveComputer,
    KSPlotComputer,
    // Add other computers here as they are implemented
    // QQPlotComputer,
    // FeatureImportanceComputer
];

export const getComputer = (type: string): AnalyticsComputer | undefined => {
    return availableComputers.find(c => c.type === type);
};
