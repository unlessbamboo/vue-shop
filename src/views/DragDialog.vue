<template>
  <section class="main">
    <div class="crumbs">
      <!-- 1. <el-breadcrumb> 是 Element UI 组件库中的面包屑导航组件，用于展示当前页面的路径导航 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-rank"></i>
          拖拽组件
        </el-breadcrumb-item>
        <el-breadcrumb-item>拖拽弹框</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 2. dialog对话框,  v-dialogDrag 是一个自定义指令(见directives.js)，用于实现拖拽功能 -->
    <div class="container">
      <p>通过指令 v-dialogDrag 使 Dialog 对话框具有可拖拽的功能。</p>
      <br />
      <el-button type="primary" @click="visible = true">点我弹框</el-button>
    </div>
    <el-dialog v-dialogDrag title="拖拽弹框" center v-model="visible" width="30%">
      我是一个可以拖拽的对话框！
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="visible = false">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
    };
  },
};
</script>

<style></style>
