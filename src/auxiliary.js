import router from "./router";
import axiosapi from "@/utils/request";

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
router.beforeEach((to, _, next) => {
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

// ------------------------------ axios ------------------------------
// 请求拦截器
axiosapi.interceptors.request.use(
  (config) => {
    // 动态改变URL
    const sessionBaseHost = window.sessionStorage.getItem("shopDynamicHost");
    if (sessionBaseHost) {
      config.baseURL = sessionBaseHost + "/api/v1/";
    }

    config.headers.Authorization = window.sessionStorage.getItem("token");
    return config; // 在发送请求之前做些什么，例如添加认证信息、设置请求头等
  },
  (error) => {
    console.log(error);
    return Promise.reject();
  },
);

// 响应拦截器
axiosapi.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response; // 对响应数据做些什么，例如处理错误状态码、数据转换等
    } else {
      Promise.reject();
    }
  },
  (error) => {
    console.log(error);
    if (error.response.status == 401) {
      router.push("/auth/login");
    }
    return Promise.reject();
  },
);
