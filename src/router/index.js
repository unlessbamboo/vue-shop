import { createRouter, createWebHistory } from "vue-router";

const Home = () => import(/* webpackChunkName: "home" */ "@/views/Home.vue");
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ "@/views/Dashboard.vue");

const UserInfos = () => import(/* webpackChunkName: "userinfos" */ "@/views/person/PersonInfos");
const PersonCenter = () => import(/* webpackChunkName: "person" */ "@/views/person/PersonCenter.vue");
const Messages = () => import(/* webpackChunkName: "messages" */ "@/views/Messages.vue");
const Roles = () => import(/* webpackChunkName: "roles" */ "@/views/power/Roles.vue");
const Rights = () => import(/* webpackChunkName: "rights" */ "@/views/power/Rights.vue");
const Order = () => import(/* webpackChunkName: "order" */ "@/views/order/Order.vue");

const GoodLayout = () => import(/* webpackChunkName: "goodlayout" */ "@/views/goods/GoodsLayout.vue");
const GoodCategories = () => import(/* webpackChunkName: "goodcategories" */ "@/views/goods/Categories.vue");
const GoodParams = () => import(/* webpackChunkName: "goodparams" */ "@/views/goods/Params.vue");
const GoodList = () => import(/* webpackChunkName: "goodlist" */ "@/views/goods/List.vue");
const GoodAdd = () => import(/* webpackChunkName: "goodadd" */ "@/views/goods/Add.vue");

const Icon = () => import(/* webpackChunkName: "icon" */ "@/views/Icon.vue");
const BaseForm = () => import(/* webpackChunkName: "form" */ "@/views/BaseForm.vue");
const Goods = () => import(/* webpackChunkName: "form" */ "@/views/goods/GoodsLayout.vue");
const VueEditor = () => import(/* webpackChunkName: "editor" */ "@/views/VueEditor.vue");
const MarkDown = () => import(/* webpackChunkName: "markdown" */ "@/views/Markdown.vue");
const Upload = () => import(/* webpackChunkName: "upload" */ "@/views/Upload.vue");
const Task = () => import(/* webpackChunkName: "task" */ "@/views/TaskList.vue");
const I18n = () => import(/* webpackChunkName: "i18n" */ "@/views/I18n.vue");
const Permission = () => import(/* webpackChunkName: "permission" */ "@/views/Permission.vue");
const NotFound = () => import(/* webpackChunkName: "404" */ "@/views/404.vue");
const Forbidden = () => import(/* webpackChunkName: "403" */ "@/views/403.vue");
const Donate = () => import(/* webpackChunkName: "donate" */ "@/views/Donate.vue");
const SystemInfo = () => import(/* webpackChunkName: "donate" */ "@/views/other/SystemInfo.vue");

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
      { path: "/dashboard", component: Dashboard, meta: { title: "系统首页" } },

      // 用户中心相关
      { path: "/userinfos", component: UserInfos, meta: { title: "用户列表" } },
      {
        path: "/user",
        component: GoodLayout,
        children: [
          { path: "", redirect: "userinfos" },
          { path: "person", component: PersonCenter, meta: { title: "个人中心" } },
          { path: "messages", component: Messages, meta: { title: "系统消息" } },
        ],
      },

      // 权限相关
      {
        path: "/power",
        component: GoodLayout,
        children: [
          { path: "", redirect: "roles" },
          { path: "roles", component: Roles, meta: { title: "角色列表" } },
          { path: "rights", component: Rights, meta: { title: "权限列表" } },
        ],
      },

      // 订单
      { path: "/orders", component: Order, meta: { title: "订单列表" } },

      // 商品信息
      {
        path: "/goods",
        component: GoodLayout,
        children: [
          { path: "", redirect: "list" },
          { path: "categories", component: GoodCategories, meta: { title: "商品分类" } },
          { path: "params", component: GoodParams, meta: { title: "分类参数" } },
          { path: "list", component: GoodList, meta: { title: "商品列表" } },
          { path: "add", component: GoodAdd, meta: { title: "添加商品" } },
        ],
      },

      { path: "/form", component: BaseForm, meta: { title: "基本表单" } },
      { path: "/goods", component: Goods, meta: { title: "商品列表" } },
      { path: "/editor", component: VueEditor, meta: { title: "富文本编辑器" } },
      { path: "/markdown", component: MarkDown, meta: { title: "arkdown编辑器" } },
      { path: "/upload", component: Upload, meta: { title: "文件上传" } },
      { path: "/task", component: Task, meta: { title: "工作流程" } },
      { path: "/systeminfo", component: SystemInfo, meta: { title: "系统监控" } },
      { path: "/icon", component: Icon, meta: { title: "自定义图标" } },
      { path: "/i18n", component: I18n, meta: { title: "国际化" } },
      { path: "/permission", component: Permission, meta: { title: "权限测试", permission: true } },
      { path: "/404", component: NotFound, meta: { title: "404" } },
      { path: "/403", component: Forbidden, meta: { title: "403" } },
      { path: "/donate", component: Donate, meta: { title: "支持作者" } },
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
