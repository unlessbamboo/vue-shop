<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="collapseChage">
      <!-- <font-awesome-icon icon="fa-solid fa-bars" /> -->
      <Icon v-if="!collapse" icon="Fold" class="shopIcon" style="margin-right: 0; width: 30px" />
      <Icon v-else icon="Expand" class="shopIcon" style="margin-right: 0; width: 30px" />
    </div>
    <div class="logo">管理-后台</div>

    <div class="header-right">
      <div class="header-user-con">
        <!-- 跳转到bamboo首页 -->
        <div class="btn-myhome" @click="handleGoHome">
          <el-tooltip effect="dark" content="个人主页" placement="bottom">
            <Icon icon="HomeFilled" class="curIcon" />
          </el-tooltip>
        </div>

        <!-- 切换后端服务 -->
        <el-dropdown class="btn-myhome" @command="handleChangeHost">
          <span class="el-dropdown-link">
            <Icon icon="Orange" class="curIcon" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="flaskapi">切换到FlaskApi</el-dropdown-item>
              <el-dropdown-item command="djangoapi">切换到DjangoApi</el-dropdown-item>
              <el-dropdown-item command="ginapi">切换到GinApi</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 全屏显示 -->
        <div class="btn-myhome" @click="handleFullScreen">
          <!-- 文字提示组件, 一般用于鼠标移入后的提示 -->
          <el-tooltip effect="dark" :content="fullscreen ? `取消全屏` : `全屏`" placement="bottom">
            <Icon icon="FullScreen" class="curIcon" />
          </el-tooltip>
        </div>

        <!-- 消息中心 -->
        <div class="btn-bell">
          <el-tooltip effect="dark" :content="message ? `有${message}条未读消息` : `消息中心`" placement="bottom">
            <!-- 
                a. router-link：是一个用于生成路由链接的组件，它会渲染为一个 <a> 标签，
                    用于在页面中创建可点击的导航链接
                b. el-icon-bell 是 Element UI 提供的一个图标组件，用于显示一个钟形的图标
            -->
            <router-link to="/user/messages">
              <Icon icon="Bell" class="curIcon" />
            </router-link>
          </el-tooltip>
          <span class="btn-bell-badge" v-if="message > 0"></span>
        </div>

        <!-- 用户头像 -->
        <div class="user-avator">
          <img src="@/assets/img/img.jpg" />
        </div>

        <!-- 用户名下拉菜单, 通过handleCommand触发回调动作 -->
        <el-dropdown class="user-name" trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ username }}
            <Icon icon="CaretBottom" class="curIcon" style="width: 20px; margin-right: 0" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="person">个人中心</el-dropdown-item>
              <a href="https://github.com/unlessbamboo/vue-shop" target="_blank">
                <el-dropdown-item divided>项目仓库</el-dropdown-item>
              </a>
              <a :href="flaskSwagger" target="_blank">
                <el-dropdown-item divided>flask swagger</el-dropdown-item>
              </a>
              <a :href="djangoSwagger" target="_blank">
                <el-dropdown-item divided>django swagger</el-dropdown-item>
              </a>
              <a :href="ginSwagger" target="_blank">
                <el-dropdown-item divided>gin swagger</el-dropdown-item>
              </a>
              <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup name="vheader">
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import SimpleApi from "@/api/simpleApi";
import Axiosapi from "@/utils/request";
import { checkRequestResult } from "@/mixins/requestCommon";

// 全局变量
const { proxy } = getCurrentInstance();
const router = useRouter();

const flaskSwagger = import.meta.env.VITE_APP_FLASK_BACKEND_HOST + "/api/v1/swagger";
const djangoSwagger = import.meta.env.VITE_APP_DJANGO_BACKEND_HOST + "/api/v1/swagger/";
const ginSwagger = import.meta.env.VITE_APP_GIN_BACKEND_HOST + "/api/v1/swagger/index.html";
const collapse = ref(true);
const fullscreen = ref(false);
const name = "linxin";
const message = ref(0);

const username = computed(() => {
  let username = localStorage.getItem("ms_username");
  return username ? username : name;
});

// 用户名下拉菜单选择事件
function handleCommand(command) {
  if (command === "loginout") {
    localStorage.removeItem("ms_username");
    router.push("/auth/login");
  } else if (command === "person") {
    router.push("/user/person");
  }
}

// 获取消息简要统计信息
const getMessageStatistics = async () => {
  const { data: result } = await SimpleApi.fetchMessageStatistics();
  if (!checkRequestResult(result, "获取系统消息简要统计信息失败!")) {
    return;
  }
  message.value = result.data.unread;
};

// 侧边栏折叠, 通过全局事件总线来进行组件间的通信, 整体的消息传递流程: header -> sidebar -> home
function collapseChage() {
  collapse.value = !collapse.value;
  proxy.$mitt.emit("collapse", collapse.value);
}

// 跳转到个人主页
function handleGoHome() {
  var homePage = import.meta.env.VITE_APP_MYHOME_HOST;
  window.location.href = homePage;
}

// 切换后端服务
function handleChangeHost(cmd) {
  var oldBaseHost = Axiosapi.dynamicURL;
  var newBaseHost = "";

  if (cmd == "flaskapi") {
    newBaseHost = import.meta.env.VITE_APP_FLASK_BACKEND_HOST;
  } else if (cmd == "djangoapi") {
    newBaseHost = import.meta.env.VITE_APP_DJANGO_BACKEND_HOST;
  } else {
    newBaseHost = import.meta.env.VITE_APP_GIN_BACKEND_HOST;
  }

  if (newBaseHost == oldBaseHost) {
    proxy.$eMessage.success("后端服务地址相同, 无需再次切换");
    return;
  }

  window.sessionStorage.setItem("shopDynamicHost", newBaseHost);
  proxy.$mitt.emit("dynamicURLChange", newBaseHost); // 使用事件总线进行通知
  proxy.$eMessage.success("成功切换后端服务为:" + newBaseHost);
}

// 全屏事件, 下面的代码是通用方式(chatgpt也是这样写的)
function handleFullScreen() {
  let element = document.documentElement;
  if (fullscreen.value) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      // IE11
      element.msRequestFullscreen();
    }
  }
  fullscreen.value = !fullscreen.value;
}

onMounted(() => {
  if (document.body.clientWidth < 1500) {
    collapseChage();
  }
  getMessageStatistics();
});
</script>

<style scoped>
.header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  /* 导航栏高度固定为70px */
  height: 70px;
  font-size: 22px;
  color: #fff;
}

/* 折叠按钮 */
.collapse-btn {
  float: left;
  padding: 0 21px;
  cursor: pointer;
  line-height: 70px;
}

/* 图标样式 */
.curIcon {
  width: 25px;
  margin-right: 10px;
  color: #fff;
  text-align: center;
  font-size: 18px;
  vertical-align: middle;
}

.header .logo {
  float: left;
  width: 250px;
  line-height: 70px;
}
.header-right {
  float: right;
  padding-right: 50px;
}
.header-user-con {
  display: flex;
  height: 70px;
  align-items: center;
}

.btn-fullscreen,
.btn-dropdown {
  transform: rotate(45deg);
  margin-right: 10px;
  font-size: 24px;
}

.btn-myhome {
  margin-right: 15px;
  font-size: 24px;
}

.btn-myhome:deep(:focus-visible) {
  outline: none; /* 解决el-dropdown鼠标hover时有边框问题 */
}

.btn-bell,
.btn-fullscreen,
.btn-dropdown,
.btn-myhome {
  display: flex;
  position: relative;
  width: 30px;
  height: 30px;
  text-align: center;
  border-radius: 15px;
  cursor: pointer;
}
.btn-bell-badge {
  position: absolute;
  right: 0;
  top: -2px;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #f56c6c;
  color: #fff;
}
.btn-bell .el-icon-bell {
  color: #fff;
}
/* 居中 */
.btn-bell .el-tooltip__trigger {
  display: flex;
}

.user-name {
  margin-left: 10px;
}
.user-avator {
  margin-left: 20px;
}
.user-avator img {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.el-dropdown-link {
  color: #fff;
  cursor: pointer;
}
/* 下拉框缩进 */
.el-dropdown-menu__item {
  text-align: left;
}
.dropdown-hide-arrow {
  display: none;
}
</style>
