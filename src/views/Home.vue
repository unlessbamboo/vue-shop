<template>
  <div class="wrapper">
    <v-head></v-head>
    <v-sidebar></v-sidebar>

    <!-- content-box和content-collpse见通用样式:  main.css -->
    <div class="content-box" :class="{ 'content-collapse': collapse }">
      <v-tags></v-tags>

      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="move" mode="out-in">
            <keep-alive :include="tagsList">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
        <el-backtop target=".content"></el-backtop>
      </div>
    </div>
  </div>
</template>

<script setup name="home">
import { ref, computed, watch, onBeforeMount, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import vHead from "@/components/Header.vue"; // 自动变为v-head
import vSidebar from "@/components/Sidebar.vue"; // 自动变为v-sidebar
import vTags from "@/components/Tags.vue"; // 自动转为v-tags

// 全局变量
const { proxy } = getCurrentInstance();
const $mitt = proxy.$mitt;

const store = useStore();
const collapse = ref(false);
const tagsList = computed({
  get() {
    return store.state.tagsList;
  },
  set(newValue) {
    return newValue;
  },
});

onBeforeMount(() => {
  // 侧边栏是否折叠, 若collapse为true, 根据样式进行左侧偏移:65px
  $mitt.on("collapse-content", (msg) => {
    collapse.value = msg;
  });
});

watch(tagsList, (msg) => {
  let arr = [];
  for (let i = 0, len = msg.length; i < len; i++) {
    msg[i].name && arr.push(msg[i].name);
  }
  tagsList.value = arr;
});
</script>
