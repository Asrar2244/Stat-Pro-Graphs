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
export const GRAPH_TYPES_CONFIG = [
  {
    type: 'scatter',
    label: 'Scatter',
    Icon: VscGraphScatter,
    children: [],
  },
  {
    type: 'line',
    label: 'Line',
    Icon: AiOutlineLineChart,
    children: [],
  },
  {
    type: 'lineAndScatter',
    label: 'Line and Scatter',
    Icon: TbChartCovariate,
    children: [],
  },
  {
    type: 'areaPlot',
    label: 'Area Plot',
    Icon: FaChartArea,
    children: [],
  },
  {
    type: 'polar',
    label: 'Polar',
    Icon: FaChartPie,
    children: [],
  },
  {
    type: 'radar',
    label: 'Radar',
    Icon: AiOutlineRadarChart,
    children: [],
  },
  {
    type: 'ternary',
    label: 'Ternary',
    Icon: TbVectorTriangle,
    children: [],
  },
  {
    type: 'verticalBar',
    label: 'Vertical Bar',
    Icon: PiChartBarFill,
    children: [],
  },
  {
    type: 'horizontalBar',
    label: 'Horizontal Bar',
    Icon: PiChartBarHorizontalFill,
    children: [],
  },
  {
    type: 'box',
    label: 'Box',
    Icon: PiBoundingBox,
    children: [],
  },
  {
    type: 'pie',
    label: 'Pie',
    Icon: AiFillPieChart,
    children: [],
  },
  {
    type: 'vector',
    label: 'Vector',
    Icon: PiVectorThreeFill,
    children: [],
  },
  {
    type: 'bubble',
    label: 'Bubble',
    Icon: TbChartBubbleFilled,
    children: [],
  },
  {
    type: 'forest',
    label: 'Forest',
    Icon: GiForestEntrance,
    children: [],
  },
  {
    type: 'contour',
    label: 'Contour',
    Icon: HiMiniSquare3Stack3D,
    children: [],
  },
  {
    type: 'scatter3d',
    label: '3D Scatter',
    Icon: TbChartScatter3D,
    children: [],
  },
  {
    type: 'line3d',
    label: '3D Line',
    Icon: LuMove3D,
    children: [],
  },
  {
    type: 'waterfall3d',
    label: '3D Waterfall',
    Icon: GiWaterfall,
    children: [],
  },
  {
    type: 'mesh3d',
    label: '3D Mesh',
    Icon: GiMeshBall,
    children: [],
  },
  {
    type: 'bar3d',
    label: '3D Bar',
    Icon: ImStatsBars2,
    children: [],
  },
];
