<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>
          <i class="el-icon-lx-redpacket_fill"></i>
          个人中心
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="person">
      <div class="personContainer">
        <div class="personSiderbar">
          <el-menu @select="personHandleSelect" default-active="basic" class="person-el-menu">
            <el-menu-item index="basic">基本设置</el-menu-item>
            <el-menu-item index="security">安全设置</el-menu-item>
          </el-menu>
        </div>
        <div class="personDetail">
          <!-- 动态地绑定到它的 is 特性，我们让多个组件可以使用同一个挂载点，并动态切换 -->
          <!-- <template v-if="activePersonTab == 'PersonBaseSetting'"> -->
          <!--   <person-base-setting></person-base-setting> -->
          <!-- </template> -->
          <component :is="activePersonTab"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="personcenter">
import { reactive, ref, onMounted, toRefs, computed, getCurrentInstance } from "vue";
import SimpleApi from "@/api/simpleApi";
import { checkRequestResult } from "@/mixins/requestCommon";

import PersonBaseSetting from "./PersonBaseSetting.vue";
import PersonSecureSetting from "./PersonSecureSetting.vue";

// 全局变量
const { proxy } = getCurrentInstance();
const activePersonTab = ref("PersonBaseSetting"); // 默认是基本设置

function personHandleSelect(key) {
  if (key == "basic") {
    activePersonTab.value = "PersonBaseSetting";
  } else {
    activePersonTab.value = "PersonSecureSetting";
  }
}
</script>

<style scope>
.person {
  height: 500px;
  background-color: #fff;
  margin: 20px 20px 0 20px;
}
.personContainer {
  height: 100%;
  position: relative;
}

/*
   1. 类似这种左右绝对定位的情况下, 子组件的宽度会决定父类的最大宽度, 所以样式调整的时候确保不受子类影响
 */

.personSiderbar {
  height: 100%;
  border-right: 1px solid #f0f0f0;
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
}
/* 清理默认的el-menu有边框样式 */
.el-menu.person-el-menu {
  border-right: 0;
}
.person-el-menu:not(.el-menu--collapse) {
  width: 150px;
}

/* 右边样式 */
.personDetail {
  display: block;
  position: absolute;
  left: 150px;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
