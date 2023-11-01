/*
 * 功能: echart的封装和定义
 * 支持: 柱状图-BarChart, 折线图-LineChart, 饼图-PieChart
 * 组件: 复用
 */
import { use } from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, BarChart, CanvasRenderer, LineChart, PieChart]);
