<template>
  <div ref="chartContainer" :style="{ height: height }"></div>
</template>

<script setup name="echarts">
import { onMounted, onUnmounted, ref } from "vue";
import * as echarts from "echarts";

const chartContainer = ref(null);
let myChart = null;

const props = defineProps({
  options: {
    type: Object, // echart数据
    default: {},
  },
  height: {
    type: String, // 高度信息, 自带单位
    default: "300px",
  },
});

onMounted(() => {
  if (chartContainer.value) {
    var _options = JSON.parse(JSON.stringify(props.options));
    myChart = echarts.init(chartContainer.value);
    myChart.setOption(_options);
  }
});

onUnmounted(() => {
  // 在组件卸载前清理图表实例
  if (myChart !== null) {
    myChart.dispose();
  }
});
</script>

<style></style>
