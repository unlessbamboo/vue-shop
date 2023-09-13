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
import "@/auxiliary";

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
