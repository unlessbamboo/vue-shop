<template>
  <div class="sidebar">
    <!-- 
        :collapse 是一个布尔类型的属性，用于控制菜单是否处于折叠状态
        :default-active="onRoutes"：通过 onRoutes 属性绑定了默认激活的菜单项(active)
        active-text-color="#20a0ff"：设置激活菜单项的文本颜色为 #20a0ff
        unique-opened：设置菜单项的展开方式为唯一展开，即同时只能展开一个菜单项

    关于路由跳转:
        el-menu: router：开启路由模式，可以根据路由配置自动激活对应的菜单项
        el-menu-item: index, 用作to属性, 当用户点击菜单项时，应用会根据这个 to 属性值来进行路由跳转
        onRoutes: 计算属性, 获取当前的路由路径，用于高亮显示当前的菜单项
    -->
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="collapse"
      background-color="#324157"
      text-color="#bfcbd9"
      active-text-color="#20a0ff"
      unique-opened
      router>
      <template v-for="item in items">
        <!-- a. 三级菜单 -->
        <template v-if="item.subs">
          <el-submenu :index="item.index" :key="item.index">
            <template #title>
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs">
              <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                <template #title>{{ subItem.title }}</template>
                <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">
                  {{ threeItem.title }}
                </el-menu-item>
              </el-submenu>
              <el-menu-item v-else :index="subItem.index" :key="subItem.index">{{ subItem.title }}</el-menu-item>
            </template>
          </el-submenu>
        </template>
        <!-- b. 二级菜单 -->
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <i :class="item.icon"></i>
            <template #title>
              <span>{{ item.title }}</span>
            </template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script setup name="sidebar">
import { ref, computed, onMounted, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const $mitt = proxy.$mitt;

const collapse = ref(false);
// 注意, 一旦item中存在2级路由, 则其他index都应该使用绝对路径, 否则会404
const items = ref([
  { icon: "el-icon-lx-home", index: "/dashboard", title: "系统首页" },
  { icon: "el-icon-lx-cascades", index: "/userinfos", title: "用户列表" },
  {
    icon: "el-icon-lx-copy",
    index: "1",
    title: "用户中心",
    subs: [
      { index: "/user/person", title: "个人中心" },
      { index: "/user/messages", title: "系统消息" },
    ],
  },
  {
    icon: "el-icon-s-check",
    index: "2",
    title: "权限管理",
    subs: [
      { index: "/power/roles", title: "角色列表" },
      { index: "/power/rights", title: "权限列表" },
    ],
  },
  {
    icon: "el-icon-s-goods",
    index: "3",
    title: "商品管理",
    subs: [
      { index: "/goods/list", title: "商品列表" },
      { index: "/goods/params", title: "分类参数" },
      { index: "/goods/categories", title: "商品分类" },
      {
        // 主要用于测试三级菜单
        index: "3-2",
        title: "商品操作",
        icon: "el-icon-lx-hot",
        subs: [{ index: "/goods/add", title: "商品添加" }],
      },
    ],
  },
  {
    icon: "el-icon-s-order",
    index: "4",
    title: "订单管理",
    subs: [{ index: "/orders", title: "订单列表" }],
  },
  {
    icon: "el-icon-lx-calendar",
    index: "5",
    title: "表单相关",
    subs: [
      { index: "/form", title: "基本表单" },
      { index: "/editor", title: "富文本编辑器" },
      { index: "/markdown", title: "markdown编辑器" },
      { index: "/upload", title: "文件上传" },
    ],
  },
  { icon: "el-icon-rank", index: "task", title: "工作流程" },
  { icon: "el-icon-monitor", index: "systeminfo", title: "系统监控" },
  { icon: "el-icon-lx-redpacket_fill", index: "/donate", title: "支持作者" },
]);

/*
这个default-active控制当前生效的页面, 这个非常重要, 若返回的值同route/index.js中不配对,
则不会生效.
*/
const onRoutes = computed(() => {
  return this.$route.path;
});
onMounted(() => {
  // 通过 Event Bus 进行组件间通信，来折叠侧边栏
  $mitt.on("collapse", (msg) => {
    this.collapse = msg;
    // 见Home.vue, 整体的消息传递流程: header -> sidebar -> home
    $mitt.emit("collapse-content", msg);
  });
});
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  /* 导航栏高度固定为70px, 见Header.vue */
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
  width: 0;
}
/* 选择所有带有.sidebar-el-menu类并且不带有.el-menu--collapse类的元素，并设置它们的宽度为200px
   + .sidebar-el-menu: 这是一个CSS类选择器
   + :not(.el-menu--collapse): 这是CSS的伪类选择器

  注意, 将该值和main.css中content-box的left偏移保持一致
 */
.sidebar-el-menu:not(.el-menu--collapse) {
  width: 200px;
}
.sidebar > ul {
  height: 100%;
}
</style>
