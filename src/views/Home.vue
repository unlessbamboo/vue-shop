<template>
  <div class="wrapper">
    <v-head></v-head>
    <v-sidebar></v-sidebar>
    <!-- content-box和content-collpse见通用样式:  main.css -->
    <div class="content-box" :class="{ 'content-collapse': collapse }">
      <v-tags></v-tags>
      <div class="content">
        <transition name="move" mode="out-in">
          <!-- <keep-alive>, 用于在组件切换时缓存和重用组件实例, 实现对路由组件的缓存
              a. 通过 include 属性指定要缓存的组件列表
              b. router-view被包裹在keep-alive中, 所以切换路由时，被缓存的组件实例会被保留，而不会被销毁
          -->
          <keep-alive :include="tagsList">
            <router-view></router-view>
          </keep-alive>
        </transition>
        <el-backtop target=".content"></el-backtop>
      </div>
    </div>
  </div>
</template>

<script>
import vHead from "@/components/Header.vue";
import vSidebar from "@/components/Sidebar.vue";
import vTags from "@/components/Tags.vue";
import bus from "@/store/bus";

export default {
  data() {
    return {
      tagsList: [],
      collapse: false,
    };
  },
  components: {
    vHead, // 自动变为v-head
    vSidebar, // 自动变为v-sidebar
    vTags, // 自动转为v-tags
  },
  created() {
    // 侧边栏是否折叠, 若collapse为true, 根据样式进行左侧偏移:65px
    bus.$on("collapse-content", (msg) => {
      this.collapse = msg;
    });

    // 缓存组件, 提高组件的加载速度, 注意, 这里和tags中的展示无关系
    bus.$on("tags-flush", (msg) => {
      let arr = [];
      for (let i = 0, len = msg.length; i < len; i++) {
        msg[i].name && arr.push(msg[i].name);
      }
      this.tagsList = arr;
    });
  },
};
</script>
