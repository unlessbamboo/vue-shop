<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="collapseChage">
      <i v-if="!collapse" class="el-icon-s-fold"></i>
      <i v-else class="el-icon-s-unfold"></i>
    </div>
    <div class="logo">管理-后台</div>

    <div class="header-right">
      <div class="header-user-con">
        <!-- 跳转到bamboo首页 -->
        <div class="btn-myhome" @click="handleGoHome">
          <el-tooltip effect="dark" content="个人主页" placement="bottom">
            <i class="el-icon-s-home"></i>
          </el-tooltip>
        </div>

        <!-- 切换后端服务 -->
        <div class="btn-fullscreen" @click="handleChangeHost">
          <el-tooltip effect="dark" content="切换服务" placement="bottom">
            <i class="el-icon-orange"></i>
          </el-tooltip>
        </div>
        <!-- 全屏显示 -->
        <div class="btn-fullscreen" @click="handleFullScreen">
          <!-- 文字提示组件, 一般用于鼠标移入后的提示 -->
          <el-tooltip effect="dark" :content="fullscreen ? `取消全屏` : `全屏`" placement="bottom">
            <i class="el-icon-rank"></i>
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
              <i class="el-icon-bell"></i>
            </router-link>
          </el-tooltip>
          <span class="btn-bell-badge" v-if="message"></span>
        </div>

        <!-- 用户头像 -->
        <div class="user-avator">
          <img src="@/assets/img/img.jpg" />
        </div>

        <!-- 用户名下拉菜单, 通过handleCommand触发回调动作 -->
        <el-dropdown class="user-name" trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ username }}
            <i class="el-icon-caret-bottom"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="person">个人中心</el-dropdown-item>
            <a href="https://github.com/unlessbamboo/vue-shop" target="_blank">
              <el-dropdown-item divided>项目仓库</el-dropdown-item>
            </a>
            <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import SimpleApi from "@/api/simpleApi";
import Axiosapi from "@/utils/request";
import bus from "@/store/bus";
import requestMixin from "@/mixins/requestMixin";

export default {
  mixins: [requestMixin],
  data() {
    return {
      collapse: true, // 默认打开侧边栏
      fullscreen: false,
      name: "linxin",
      message: 0,
    };
  },
  computed: {
    username() {
      let username = localStorage.getItem("ms_username");
      return username ? username : this.name;
    },
  },
  methods: {
    // 用户名下拉菜单选择事件
    handleCommand(command) {
      if (command == "loginout") {
        localStorage.removeItem("ms_username");
        this.$router.push("/auth/login");
      } else if (command == "person") {
        this.$router.push("/user/person");
        // this.$route.path.replace("/user/person", "");
      }
    },

    // 获取消息简要统计信息
    async getMessageStatistics() {
      const { data: result } = await SimpleApi.fetchMessageStatistics();
      if (!this.checkRequestResult(result, "获取系统消息简要统计信息失败!")) {
        return;
      }
      this.message = result.data.unread;
    },

    // 侧边栏折叠, 通过全局事件总线来进行组件间的通信, 整体的消息传递流程: header -> sidebar -> home
    collapseChage() {
      this.collapse = !this.collapse;
      bus.$emit("collapse", this.collapse);
    },
    // 跳转到个人主页
    handleGoHome() {
      var homePage = process.env.VUE_APP_MYHOME_HOST;
      window.location.href = homePage;
    },

    // 切换后端服务
    handleChangeHost() {
      var oldBaseHost = Axiosapi.dynamicURL;

      var newBaseHost;
      if (oldBaseHost == process.env.VUE_APP_FLASK_BACKEND_HOST) {
        newBaseHost = process.env.VUE_APP_GIN_BACKEND_HOST;
      } else {
        newBaseHost = process.env.VUE_APP_FLASK_BACKEND_HOST;
      }
      window.sessionStorage.setItem("shopDynamicHost", newBaseHost);
      bus.$emit("dynamicURLChange", newBaseHost); // 使用事件总线进行通知
      this.$message.success("成功切换后端服务为:" + newBaseHost);
    },

    // 全屏事件, 下面的代码是通用方式(chatgpt也是这样写的)
    handleFullScreen() {
      let element = document.documentElement;
      if (this.fullscreen) {
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
      this.fullscreen = !this.fullscreen;
    },
  },
  mounted() {
    if (document.body.clientWidth < 1500) {
      this.collapseChage();
    }

    this.getMessageStatistics();
  },
};
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

.btn-fullscreen {
  transform: rotate(45deg);
  margin-right: 5px;
  font-size: 24px;
}

.btn-myhome {
  margin-right: 5px;
  font-size: 24px;
}

.btn-bell,
.btn-fullscreen,
.btn-myhome {
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
.el-dropdown-menu__item {
  text-align: center;
}
</style>
