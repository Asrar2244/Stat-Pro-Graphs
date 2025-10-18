import type { GraphOption } from './types';
import { MdScatterPlot, MdShowChart, MdBarChart, MdAreaChart, MdHistory, MdBolt, MdHeatPump, MdDashboard, MdMap, MdVolumeUp, MdRadar, MdAccountTree, MdBubbleChart, MdTimeline } from 'react-icons/md';

export const graph2DOptions: GraphOption[] = [
  {
    label: 'Basic',
    children: [
      { label: 'Scatter Plot', value: 'scatter', execute: 'open-scatter-plot-modal', icon: MdScatterPlot },
      { label: 'Line Chart', value: 'line', execute: 'open-line-plot-modal', icon: MdShowChart },
      { label: 'Line/Scatter', value: 'line-scatter', execute: 'open-line-scatter-plot-modal', icon: MdTimeline },
      { label: 'Bar Chart', value: 'bar', execute: 'bar-chart', icon: MdBarChart },
      { label: 'Area Chart', value: 'area', execute: 'area-chart', icon: MdAreaChart },
    ]
  },
  {
    label: 'Statistical',
    children: [
      { label: 'Histogram', value: 'histogram', execute: 'histogram', icon: MdHistory },
      { label: 'Box Plot', value: 'box', execute: 'box-plot', icon: MdBolt },
      { label: 'Violin Plot', value: 'violin', execute: 'violin-plot', icon: MdBolt },
      { label: 'Heatmap', value: 'heatmap', execute: 'heatmap', icon: MdHeatPump },
    ]
  }
];

export const graph3DOptions: GraphOption[] = [
  {
    label: 'Surface',
    children: [
      { label: '3D Mesh', value: 'mesh', execute: '3d-mesh', icon: MdDashboard },
      { label: '3D Surface', value: 'surface', execute: '3d-surface', icon: MdDashboard },
      { label: '3D Scatter', value: 'scatter3d', execute: '3d-scatter', icon: MdScatterPlot },
      { label: '3D Bar', value: 'bar3d', execute: '3d-bar', icon: MdBarChart },
      { label: '3D Line', value: 'line3d', execute: '3d-line', icon: MdShowChart },
    ]
  },
  {
    label: 'Advanced 3D',
    children: [
      { label: '3D Contour', value: 'contour3d', execute: '3d-contour', icon: MdMap },
      { label: '3D Volume', value: 'volume', execute: '3d-volume', icon: MdVolumeUp },
    ]
  }
];

export const graphAdvancedOptions: GraphOption[] = [
  {
    label: 'Specialized',
    children: [
      { label: 'Polar Plot', value: 'polar', execute: 'polar-plot', icon: MdRadar },
      { label: 'Radar Chart', value: 'radar', execute: 'radar-chart', icon: MdRadar },
      { label: 'Sankey Diagram', value: 'sankey', execute: 'sankey-diagram', icon: MdAccountTree },
      { label: 'Treemap', value: 'treemap', execute: 'treemap', icon: MdDashboard },
    ]
  },
  {
    label: 'Interactive',
    children: [
      { label: 'Network Graph', value: 'network', execute: 'network-graph', icon: MdAccountTree },
      { label: 'Chord Diagram', value: 'chord', execute: 'chord-diagram', icon: MdBubbleChart },
      { label: 'Sunburst', value: 'sunburst', execute: 'sunburst', icon: MdRadar },
      { label: 'Parallel Coordinates', value: 'parallel', execute: 'parallel-coordinates', icon: MdShowChart },
    ]
  }
];