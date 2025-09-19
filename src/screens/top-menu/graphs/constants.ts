import { FaChartArea, FaChartPie } from 'react-icons/fa6';
import { VscGraphScatter } from 'react-icons/vsc';
import { AiOutlineLineChart, AiOutlineRadarChart, AiFillPieChart } from 'react-icons/ai';
import {
  TbChartBubbleFilled,
  TbChartCovariate,
  TbChartScatter3D,
  TbVectorTriangle,
} from 'react-icons/tb';
import {
  PiChartBarFill,
  PiChartBarHorizontalFill,
  PiBoundingBox,
  PiVectorThreeFill,
} from 'react-icons/pi';
import { LuMove3D } from 'react-icons/lu';
import { GiForestEntrance, GiWaterfall, GiMeshBall } from 'react-icons/gi';
import { HiMiniSquare3Stack3D } from 'react-icons/hi2';
import { ImStatsBars2 } from 'react-icons/im';
import type { GraphOption } from './types';

export const SCATTER_SUB_TYPES = [
  'Simple Scatter',
  'Simple Scatter Regression',
  'Multi Scatter',
  'Multi Scatter Regression',
  'Simple Scatter Error Bar',
  'Simple Scatter Error Bar and Regression',
  'Multi Scatter Error Bar',
  'Multi Scatter Error Bar and Regression',
  'Simple Scatter Horizontal Error Bar',
  'Simple Scatter Bidirectional Error Bars',
  'Vertical Asymmetric Error Bars',
  'Horizontal Asymmetric Error Bars',
  'Vertical Point Plots',
  'Horizontal Point Plots',
  'Vertical Dot Plot',
  'Horizontal Dot Plot',
] as const;

// 2D Graph Options
export const graph2DOptions: GraphOption[] = [
  {
    label: 'Basic Charts',
    value: 'basic',
    children: [
      { label: 'Scatter Plot', value: 'scatter', icon: VscGraphScatter, execute: 'open-scatter-plot-modal' },
      { label: 'Line Chart', value: 'line', icon: AiOutlineLineChart, execute: 'line-chart' },
      { label: 'Line and Scatter', value: 'lineAndScatter', icon: TbChartCovariate, execute: 'line-scatter' },
      { label: 'Area Plot', value: 'areaPlot', icon: FaChartArea, execute: 'area-plot' },
    ],
  },
  {
    label: 'Bar Charts',
    value: 'bar',
    children: [
      { label: 'Vertical Bar', value: 'verticalBar', icon: PiChartBarFill, execute: 'vertical-bar' },
      { label: 'Horizontal Bar', value: 'horizontalBar', icon: PiChartBarHorizontalFill, execute: 'horizontal-bar' },
    ],
  },
  {
    label: 'Statistical',
    value: 'statistical',
    children: [
      { label: 'Box Plot', value: 'box', icon: PiBoundingBox, execute: 'box-plot' },
      { label: 'Bubble Chart', value: 'bubble', icon: TbChartBubbleFilled, execute: 'bubble-chart' },
    ],
  },
  {
    label: 'Circular Charts',
    value: 'circular',
    children: [
      { label: 'Pie Chart', value: 'pie', icon: AiFillPieChart, execute: 'pie-chart' },
      { label: 'Polar Chart', value: 'polar', icon: FaChartPie, execute: 'polar-chart' },
      { label: 'Radar Chart', value: 'radar', icon: AiOutlineRadarChart, execute: 'radar-chart' },
    ],
  },
];

// 3D Graph Options
export const graph3DOptions: GraphOption[] = [
  {
    label: 'Basic 3D',
    value: 'basic3d',
    children: [
      { label: '3D Scatter', value: 'scatter3d', icon: TbChartScatter3D, execute: 'scatter-3d' },
      { label: '3D Line', value: 'line3d', icon: LuMove3D, execute: 'line-3d' },
      { label: '3D Bar', value: 'bar3d', icon: ImStatsBars2, execute: 'bar-3d' },
    ],
  },
  {
    label: 'Surface & Volume',
    value: 'surface',
    children: [
      { label: '3D Mesh', value: 'mesh3d', icon: GiMeshBall, execute: 'mesh-3d' },
      { label: '3D Waterfall', value: 'waterfall3d', icon: GiWaterfall, execute: 'waterfall-3d' },
    ],
  },
];

// Advanced Graph Options
export const graphAdvancedOptions: GraphOption[] = [
  {
    label: 'Specialized',
    value: 'specialized',
    children: [
      { label: 'Ternary Plot', value: 'ternary', icon: TbVectorTriangle, execute: 'ternary-plot' },
      { label: 'Vector Plot', value: 'vector', icon: PiVectorThreeFill, execute: 'vector-plot' },
      { label: 'Forest Plot', value: 'forest', icon: GiForestEntrance, execute: 'forest-plot' },
      { label: 'Contour Plot', value: 'contour', icon: HiMiniSquare3Stack3D, execute: 'contour-plot' },
    ],
  },
];
