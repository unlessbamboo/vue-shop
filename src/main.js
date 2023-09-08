import Vue from "vue";
import App from "./App.vue";
import moment from "moment";
import router from "./router";
import ElementUI from "element-ui";
import VueI18n from "vue-i18n";
import TreeTable from "vue-table-with-tree-grid";
import VueQuillEditor from "vue-quill-editor";
import "quill/dist/quill.core.css"; // import styles
import "quill/dist/quill.snow.css"; // for snow theme
import "quill/dist/quill.bubble.css"; // for bubble theme

import "element-ui/lib/theme-chalk/index.css"; // 默认主题

import {messages} from "@/utils/i18n";
import axiosapi from "@/utils/request";
import "@/assets/css/icon.css";
import "@/plugins/directives";
import "babel-polyfill";

Vue.prototype.$http = axiosapi;
Vue.config.productionTip = false;

Vue.component("tree-table", TreeTable);
Vue.use(VueQuillEditor);
Vue.use(VueI18n);
Vue.use(ElementUI, {
  size: "small",
});
const i18n = new VueI18n({
  locale: "zh",
  messages,
});

/*
 * 功能: 使用钩子函数对路由进行权限跳转
 * 具体: 在每次路由切换前会执行该函数, 用于实现:
 *    a. 设置页面标题
 *    b. 检查用户角色是否存在，若不存在则重定向到登录页
 *    c. 根据角色和权限配置进行路由访问控制
 *    d. 在不兼容的浏览器上对特定路由进行提示
 * 参数说明:
 *    to:
 *      {
 *        fullPath: "/tabs",
 *        path: "/tabs",
 *        matched: [],
 *        meta: {title: "tab选项卡"},   // 见router/index.js中的定义, meta实际上是默认项, 不设置为{}
 *        name: undefined,
 *        params: {},
 *        query: {},
 *      }
 *    from: 类似上面, 表示原始的路由地址
 *    next: 一个回调函数
 */
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | bamboo`;
  let unauthRouters = ["/auth/login", "/auth/register", "/auth/reset"];

  const role = localStorage.getItem("ms_username");

  // 1. 判断是否已经登录
  if (!role) {
    if (!unauthRouters.includes(to.path)) {
      next("/auth/login");
    } else {
      next();
    }
    return;
  }

  // 2. 管理员界面判定
  if (to.meta.permission) {
    // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
    role === "admin" ? next() : next("/403");
    return;
  }

  // 3. 其他界面
  // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
  if (navigator.userAgent.indexOf("MSIE") > -1 && to.path === "/editor") {
    Vue.prototype.$alert("vue-quill-editor组件不兼容IE10及以下浏览器", "浏览器不兼容通知", {
      confirmButtonText: "确定",
    });
  } else {
    next();
  }
  return;
});

Vue.filter("dateFormat", function (originVal) {
  if (typeof originVal === "string") {
    return originVal;
  }

  const dt = new Date(originVal * 1000);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + "").padStart(2, "0"); // 如果不是两位前面用0填充
  const d = (dt.getDate() + "").padStart(2, "0");
  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});

Vue.filter("dateFormatConvert", function (value) {
  if (!value) return "";
  return moment(value).format("YYYY-MM-DD HH:mm:ss");
});

new Vue({
  router,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
