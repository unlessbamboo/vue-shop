<template>
  <div class="tags" v-if="showTags">
    <ul>
      <li class="tags-li" v-for="(item, index) in tagsList" :class="{ active: isActive(item.path) }" :key="index">
        <router-link :to="item.path" class="tags-li-title">
          {{ item.title }}
        </router-link>
        <span class="tags-li-icon" @click="closeTags(index)"><i class="el-icon-close"></i></span>
      </li>
    </ul>

    <!-- el-dropdown 是 Element UI 中的下拉菜单组件，用于创建一个可触发下拉菜单的按钮或区域。 -->
    <div class="tags-close-box">
      <el-dropdown @command="handleTags">
        <el-button size="mini" type="primary">
          标签选项
          <!-- el-icon--right 类作为 el-icon 的附加类，以实现右对齐效果
              a. -- 用于表示一种特定的 CSS 类名格式，用于为元素添加额外的样式
              b. -- 后面跟着的部分通常表示某种特定的样式变种或修饰，用于修改组件的外观或行为
          -->
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>

        <template #dropdown>
          <el-dropdown-menu size="small">
            <el-dropdown-item command="other">关闭其他</el-dropdown-item>
            <el-dropdown-item command="all">关闭所有</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup name="tags">
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import SimpleApi from "@/api/simpleApi";
import Axiosapi from "@/utils/request";
import { checkRequestResult } from "@/mixins/requestCommon";

// 全局变量
const { proxy } = getCurrentInstance();
const $mitt = proxy.$mitt;
const router = useRouter();
const store = useStore();
const tagsList = ref([]);

function isActive(path) {
  return path === router.currentRoute.value.fullPath;
}
// 关闭单个标签
function closeTags(index) {
  const delItem = tagsList.value.splice(index, 1)[0];
  const item = tagsList.value[index] ? tagsList.value[index] : tagsList.value[index - 1];
  if (item) {
    delItem.path === router.currentRoute.value.fullPath && router.push(item.path);
  } else {
    router.push("/");
  }
}
// 关闭全部标签
function closeAll() {
  tagsList.value = [];
  router.push("/");
}
// 关闭其他标签
function closeOther() {
  const curItem = tagsList.value.filter((item) => {
    return item.path === router.currentRoute.value.fullPath;
  });
  tagsList.value = curItem;
}

// 设置标签, 每次监视器发现路由变化的时候否会调用该函数
function setTags(myRoute) {
  // a. 设置展示数组, tagsList会自动在模板中被遍历并展示
  const isExist = tagsList.value.some((item) => {
    return item.path === myRoute.fullPath;
  });

  if (!isExist) {
    if (tagsList.value.length >= 8) {
      tagsList.value.shift();
    }
    tagsList.value.push({
      title: myRoute.meta.title,
      path: myRoute.fullPath,
      name: myRoute.matched[1].components.default.name,
    });
  }

  // b. 见home.vue, 主要用于组件的缓存, 与展示无关
  // $mitt.emit("tags-flush", this.tagsList);
  store.dispatch("updateTagsList", tagsList.value);
}

function handleTags(command) {
  command === "other" ? closeOther() : closeAll();
}

// =================计算属性和生命周期=================
const showTags = computed(() => {
  return this.tagsList.length > 0;
});
/*
功能: 一个监视器函数，用于监听路由对象的变化。当路由发生变化时，会触发该监视器函数，
    并传入新的路由对象 newValue 和旧的路由对象 oldValue. 即任何路由变化都会自动被这里捕获
    然后将新的路由选项卡添加到taglists中.
另外:
    $route 是 Vue Router 提供的路由对象，在 Vue 组件中可以通过 $route 访问当前路由的信息
    注意, 监视器和计算属性的区别.
*/
watch(route, (newValue, oldValue) => {
  setTags(newValue);
});

onMounted(() => {
  setTags(route);

  $mitt.on("close_current_tags", () => {
    for (let i = 0, len = tagsList.value.length; i < len; i++) {
      const item = tagsList.value[i];
      if (item.path === route.fullPath) {
        if (i < len - 1) {
          router.push(tagsList.value[i + 1].path);
        } else if (i > 0) {
          router.push(tagsList.value[i - 1].path);
        } else {
          router.push("/");
        }
        tagsList.value.splice(i, 1);
        break;
      }
    }
  });
});
</script>

<style>
/* 1. 若是真的存在很多通用的样式, 可以在不设置的scoped的情况下, 通过外层包裹特定div来增加条件?
   那也是不行的, .tags-li.active和.tags .tags-li.active是两个不同的选择器哦
   2. 通过scss的变量来引用
 */
.tags {
  position: relative;
  height: 30px;
  overflow: hidden;
  background: #fff;
  padding-right: 120px;
  box-shadow: 0 5px 10px #ddd;
}

.tags ul {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.tags-li {
  float: left;
  margin: 3px 5px 2px 3px;
  border-radius: 3px;
  font-size: 12px;
  overflow: hidden;
  cursor: pointer;
  height: 23px;
  line-height: 23px;
  border: 1px solid #e9eaec;
  background: #fff;
  padding: 0 5px 0 12px;
  vertical-align: middle;
  color: #666;
  -webkit-transition: all 0.3s ease-in;
  -moz-transition: all 0.3s ease-in;
  transition: all 0.3s ease-in;
}

.tags-li:not(.active):hover {
  background: #f8f8f8;
}

/* 一旦设置就无法在组件内部的样式中引用外部的样式，为何? 
   答案: 一旦设置scoped, 样式就增加了attr, 此时就无法继承外层的无attr的相同样式名
   问题: v-deep为何不生效
 */
.tags-li.active {
  color: #fff;
}

.tags .tags-li-title {
  float: left;
  max-width: 80px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 5px;
  color: #666;
}

.tags .tags-li.active .tags-li-title {
  color: #fff;
}

.tags .tags-close-box {
  position: absolute;
  right: 0;
  top: 0;
  box-sizing: border-box;
  padding-top: 1px;
  text-align: center;
  width: 110px;
  height: 30px;
  background: #fff;
  box-shadow: -3px 0 15px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
</style>
