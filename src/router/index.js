import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("@/views/Home.vue");
const Dashboard = () => import("@/views/Dashboard.vue");

const UserInfos = () => import("@/views/person/PersonInfos.vue");
const PersonCenter = () => import("@/views/person/PersonCenter.vue");
const Messages = () => import("@/views/Messages.vue");
const Roles = () => import("@/views/power/Roles.vue");
const Rights = () => import("@/views/power/Rights.vue");
const Order = () => import("@/views/order/Order.vue");

const GoodLayout = () => import("@/views/goods/GoodsLayout.vue");
const GoodCategories = () => import("@/views/goods/Categories.vue");
const GoodParams = () => import("@/views/goods/Params.vue");
const GoodList = () => import("@/views/goods/List.vue");
const GoodAdd = () => import("@/views/goods/Add.vue");

const Icon = () => import("@/views/other/Icon.vue");
const BaseForm = () => import("@/views/other/BaseForm.vue");
const Goods = () => import("@/views/goods/GoodsLayout.vue");
const VueEditor = () => import("@/views/other/VueEditor.vue");
const Task = () => import("@/views/other/TaskList.vue");
const I18n = () => import("@/views/other/I18n.vue");
const Permission = () => import("@/views/Permission.vue");
const NotFound = () => import("@/views/404.vue");
const Forbidden = () => import("@/views/403.vue");
const Donate = () => import("@/views/other/Donate.vue");
const SystemInfo = () => import("@/views/other/SystemInfo.vue");

const AuthLayout = () => import("@/views/auth/AuthLayout.vue");
const AuthLogin = () => import("@/views/auth/Login.vue");
const AuthRegister = () => import("@/views/auth/Register.vue");
const AuthReset = () => import("@/views/auth/Reset.vue");

const routes = [
  { path: "/", redirect: "/dashboard" },
  {
    path: "/",
    component: Home,
    meta: { title: "自述文件" },
    children: [
      { path: "dashboard", component: Dashboard, meta: { title: "系统首页" } },

      // 用户中心相关
      { path: "userinfos", component: UserInfos, meta: { title: "用户列表" } },
      {
        path: "user",
        component: GoodLayout,
        children: [
          { path: "", redirect: "userinfos" },
          { path: "person", component: PersonCenter, meta: { title: "个人中心" } },
          { path: "messages", component: Messages, meta: { title: "系统消息" } },
        ],
      },

      // 权限相关
      {
        path: "power",
        component: GoodLayout,
        children: [
          { path: "", redirect: "roles" },
          { path: "roles", component: Roles, meta: { title: "角色列表" } },
          { path: "rights", component: Rights, meta: { title: "权限列表" } },
        ],
      },

      // 订单
      { path: "orders", component: Order, meta: { title: "订单列表" } },

      // 商品信息
      {
        path: "goods",
        component: GoodLayout,
        children: [
          { path: "", redirect: "list" },
          { path: "categories", component: GoodCategories, meta: { title: "商品分类" } },
          { path: "params", component: GoodParams, meta: { title: "分类参数" } },
          { path: "list", component: GoodList, meta: { title: "商品列表" } },
          { path: "add", component: GoodAdd, meta: { title: "添加商品" } },
        ],
      },

      { path: "form", component: BaseForm, meta: { title: "基本表单" } },
      { path: "goods", component: Goods, meta: { title: "商品列表" } },
      { path: "editor", component: VueEditor, meta: { title: "富文本编辑器" } },
      { path: "task", component: Task, meta: { title: "工作流程" } },
      { path: "systeminfo", component: SystemInfo, meta: { title: "系统监控" } },
      { path: "icon", component: Icon, meta: { title: "自定义图标" } },
      { path: "i18n", component: I18n, meta: { title: "国际化" } },
      { path: "permission", component: Permission, meta: { title: "权限测试", permission: true } },
      { path: "404", component: NotFound, meta: { title: "404" } },
      { path: "403", component: Forbidden, meta: { title: "403" } },
      { path: "donate", component: Donate, meta: { title: "支持作者" } },
    ],
  },
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      { path: "", redirect: "login" },
      { path: "login", component: AuthLogin, meta: { title: "登录" } },
      { path: "register", component: AuthRegister, meta: { title: "注册" } },
      { path: "reset", component: AuthReset, meta: { title: "重置密码" } },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/404" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
