<template>
  <section class="main">
    <div class="crumbs">
      <!-- el-breadcrumb 是 Element UI 组件库中的一个面包屑导航组件，用于展示当前页面在导航层级中的位置。 
          el-breadcrumb-item 子组件来定义面包屑的各个层级。每个 el-breadcrumb-item 表示一个导航项
      -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <Icon icon="Grid" class="shopIcon" />
          拖拽组件
        </el-breadcrumb-item>
        <el-breadcrumb-item>拖拽排序</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="container">
      <div class="plugins-tips">
        Vue.Draggable：基于 Sortable.js 的 Vue 拖拽组件。 访问地址：
        <a href="https://github.com/SortableJS/vue.draggable.next" target="_blank">Vue.Draggable</a>
      </div>

      <div class="drag-box">
        <!-- 注意, template不存在, 不能设置key -->
        <template v-for="(index, dragname) in dragCategories" :key="index">
          <div class="drag-box-item">
            <div class="item-title">{{ dragname }}</div>
            <!-- 
              todo: 通过 v-model 指令将 todo 数据与组件进行双向绑定，使得拖拽排序后的结果反映在数据上
              options: 属性传递配置选项给组件，用于自定义拖拽排序的行为和样式
              transtition-group: 在列表或容器中应用过渡效果。它可以实现在元素插入、更新、移除时添加动画效果
                + tag 属性用于指定过渡组件渲染的 HTML 标签, tag="div" 表示 <transition-group> 
                    组件会被渲染为 <div> 标签
                + 元素会应用 id="todo" 和 class="item-ul" 的属性和样式
              @remove: 表示单元被移动到另一个列表时的回调函数
            -->
            <draggable
              v-model="draginfo[dragname]"
              group="people"
              @change="addHandle($event, dragname)"
              class="item-ul"
              item-key="id">
              <template #item="{ element }">
                <div class="drag-list">
                  {{ element.content }}
                </div>
              </template>
            </draggable>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup name="draglist">
import { reactive, ref, onMounted, toRefs, computed, getCurrentInstance, nextTick, watch } from "vue";
import { Delete, Edit, Setting, Search, ArrowRight } from "@element-plus/icons-vue";
import SimpleApi from "@/api/simpleApi";
import { ElMessageBox } from "element-plus";
import { checkRequestResult } from "@/mixins/requestCommon";
import categoryMixin from "@/mixins/categoryMixin";
import draggable from "vuedraggable";

// 全局变量
const { proxy } = getCurrentInstance();

const dragOptions = ref({
  animation: 120,
  scroll: true,
  group: "sortlist",
  ghostClass: "ghost-style",
});
const dragCategories = ref({ todo: "todo", doing: "doing", done: "done" });
const draginfo = ref({
  todo: [
    {
      id: 1,
      content: "开发图表组件",
      dragType: "todo",
    },
    {
      id: 2,
      content: "开发拖拽组件",
      dragType: "todo",
    },
    {
      id: 3,
      content: "开发权限测试组件",
      dragType: "todo",
    },
  ],
  doing: [
    {
      id: 4,
      content: "开发登录注册页面",
      dragType: "doing",
    },
    {
      id: 5,
      content: "开发头部组件",
      dragType: "doing",
    },
    {
      id: 6,
      content: "开发表格相关组件",
      dragType: "doing",
    },
    {
      id: 7,
      content: "开发表单相关组件",
      dragType: "doing",
    },
  ],
  done: [
    {
      id: 8,
      content: "初始化项目，生成工程目录，完成相关配置",
      dragType: "done",
    },
    {
      id: 9,
      content: "开发项目整体框架",
      dragType: "done",
    },
  ],
});

/*
生命周期和watch
*/
watch(
  draginfo,
  (newValue, oldValue) => {
    console.log("新的draginfo值:", newValue);
  },
  {
    deep: true,
  },
);

/*
methods
*/
// event包含: {to, from, item, clone, oldIndex, newIndex}
function addHandle(event, dragname) {
  if (!event.added) {
    return;
  }
  // 将新的数据类型更改
  var item = event.added.element;
  item.dragType = dragname;
  proxy.$eMessage.success(`元素<${item.content}>移动到 ${dragname} `);
}
// 根据category获取类型
function getTypeByCategory(category) {
  return dragCategories.value.category ? dragCategories.value.category : "todo";
}
// draggable对应的component data方法
function getComponentData() {
  return {
    tag: "div",
    id: "dragname",
  };
}
</script>

<style scoped>
/* 三个div: drag-box-item平行布局 */
.drag-box {
  display: flex;
  justify-content: space-evenly; /* 元素在容器内平均分布，并且每个元素周围以及两侧都有一样的空白间隔 */
  user-select: none;
}
.drag-box-item {
  /* 使盒子元素在水平方向上自动填充剩余空间，实现等分布局. 
     将 .drag-box-item 元素在父容器中的剩余空间均匀地分配给该元素
  */
  flex: 1;
  max-width: 330px;
  min-width: 300px;
  background-color: #eff1f5;
  margin-right: 16px;
  border-radius: 6px;
  border: 1px #e1e4e8 solid;
}
.item-title {
  padding: 8px 8px 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #24292e;
  font-weight: 600;
}

.item-ul {
  padding: 0 8px 8px;
  height: 500px;
  overflow-y: scroll; /* 设置容器在内容溢出时垂直滚动*/
}
/* 针对 WebKit 内核浏览器自定义滚动条样式: 滚动条的宽度设置为 0，隐藏滚动条 */
.item-ul::-webkit-scrollbar {
  width: 0;
}

.drag-list {
  border: 1px #e1e4e8 solid;
  padding: 10px;
  margin: 5px 0 10px;
  list-style: none; /* 移除列表项的默认样式*/
  background-color: #fff;
  border-radius: 6px;
  cursor: pointer; /* 鼠标 */
  /* 设置"边框变化"的过渡效果，持续时间为 0.3 秒，缓动函数为 ease-in */
  -webkit-transition: border 0.3s ease-in;
  transition: border 0.3s ease-in;
}
/* 鼠标移入的时候设置蓝色边框 */
.drag-list:hover {
  border: 1px solid #20a0ff;
}
.drag-title {
  font-weight: 400;
  line-height: 25px;
  margin: 10px 0;
  font-size: 22px;
  color: #1f2f3d;
}
.ghost-style {
  display: block;
  color: transparent;
  border-style: dashed;
}
</style>
