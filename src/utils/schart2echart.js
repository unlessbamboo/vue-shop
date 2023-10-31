/*
 * 功能: 将schart后端数据转为echart
 */

const Schart2EchartApi = {
  // @function: 柱状图
  s2eOfBar(options) {
    return {
      textStyle: {
        // 字体信息
      },
      // 标题组件
      title: {
        text: options.title.text,
      },
      // 提示框组件: show-是否显示提示框, trigger-触发类型
      tooltip: {
        trigger: "axis",
      },
      // 图例组件: 展现了不同系列的标记(symbol)，颜色和名字, 可通过点击图例控制哪些系列不显示
      legend: {
        data: options.datasets.map((dataset) => dataset.label),
      },
      // 直角坐标系 grid 中的 x 轴
      xAxis: {
        data: options.labels,
        axisLabel: {
          rotate: options.xRorate,
        },
      },
      yAxis: {},
      series: options.datasets.map((dataset) => ({
        name: dataset.label,
        type: "bar",
        data: dataset.data,
      })),
    };
  },

  // @function: 折线图
  s2eOfLineStack(options) {
    return {
      title: {
        text: options.title.text,
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: options.datasets.map((dataset) => dataset.label),
      },
      xAxis: {
        data: options.labels,
      },
      yAxis: {},
      series: options.datasets.map((dataset) => ({
        name: dataset.label,
        type: "line", // 注意这里的类型是 'line'
        stack: "Total",
        data: dataset.data,
      })),
    };
  },

  // @function: 简单饼图
  s2eOfPieSimple(schartData) {
    let echartData = [];
    schartData.labels.forEach((label, index) => {
      let totalValue = 0;
      schartData.datasets.forEach((dataset) => {
        totalValue += dataset.data[index];
      });
      echartData.push({
        name: label,
        value: totalValue,
      });
    });
    return {
      title: {
        text: schartData.title.text,
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: schartData.legend.position === "left" ? "vertical" : "horizontal",
        left: schartData.legend.position,
      },
      backgroundColor: schartData.bgColor,
      series: [
        {
          name: "销售",
          type: "pie",
          data: echartData,
        },
      ],
    };
  },

  // @function: 环形图
  s2eOfPieDoughnut(schartData) {
    let echartData = [];
    schartData.labels.forEach((label, index) => {
      let totalValue = 0;
      schartData.datasets.forEach((dataset) => {
        totalValue += dataset.data[index];
      });
      echartData.push({
        name: label,
        value: totalValue,
      });
    });

    return {
      title: {
        text: schartData.title.text,
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "horizontal",
        bottom: schartData.legend.bottom,
      },
      backgroundColor: schartData.bgColor,
      series: [
        {
          name: "销售",
          type: "pie",
          radius: ["40%", "70%"], // 这里定义环形图的内外半径
          avoidLabelOverlap: true,
          label: {
            show: schartData.showValue,
            position: "center",
          },
          data: echartData,
        },
      ],
    };
  },
};

export default Schart2EchartApi;
