export type BoxPlotOrientation = 'vertical' | 'horizontal';

export type BoxPlotSubType =
    | 'Vertical Box Plot'
    | 'Horizontal Box Plot';

export type DataFormat =
    // Vertical Box Plot formats
    | 'Many Y'
    | 'X Many Y'
    // Horizontal Box Plot formats
    | 'Many X'
    | 'Y Many X';

export interface Variable {
    name: string;
    type: 'numeric' | 'categorical';
    selected?: boolean;
}

export interface BoxPlotConfig {
    selectedProject: string;
    graphType: 'Box Plot';
    subType: BoxPlotSubType;
    dataFormat: DataFormat;
    variables: {
        x: string[];
        y: string[];
        category?: string[];
    };
    boxWidth?: number;
    showMean?: boolean;
    showOutliers?: boolean;
    showAllPoints?: boolean;
    orientation: BoxPlotOrientation;
}
