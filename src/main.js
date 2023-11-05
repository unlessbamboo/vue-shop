import { createApp, createVNode } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/vuex";
import ElementPlus from "element-plus";
import { createI18n } from "vue-i18n";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import moment from "moment";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue"; // 引入所有图标，并命名为 Icons
import axiosapi from "@/utils/request";
import elementMessage from "@/utils/message";
import { messages } from "@/utils/i18n";
import emitter from "@/store/bus";
import "@/assets/css/icon.css";
import "@/auxiliary";

import { FontAwesomeIcon } from "@/utils/icon";
import dialogDrag from "@/plugins/directives";

const app = createApp(App);

window.emitter = emitter;
app.config.globalProperties.$http = axiosapi;
app.config.globalProperties.$eMessage = elementMessage; // 用于替代vue2中的$eMessage.
app.config.globalProperties.$mitt = emitter; // 新版本事件总线

// 全局注册elementplus图标
/* Object.keys(ElementPlusIconsVue).forEach((key) => {
  console.log(key);
  app.component(key, ElementPlusIconsVue[key]);
}); */
// Icon自定组件
const Icon = (props) => {
  const { icon } = props;
  return createVNode(ElementPlusIconsVue[icon]);
};
app.component("Icon", Icon);
app.component("QuillEditor", QuillEditor);
app.use(ElementPlus, {
  size: "small",
});

const i18n = createI18n({
  locale: "zh",
  messages,
});

app.use(i18n);

app.config.globalProperties.$filters = {
  dateFormat(originVal) {
    if (typeof originVal === "string") {
      return originVal;
    }

    const dt = new Date(originVal * 1000);
    const y = dt.getFullYear();
    const m = (dt.getMonth() + 1 + "").padStart(2, "0");
    const d = (dt.getDate() + "").padStart(2, "0");
    const hh = (dt.getHours() + "").padStart(2, "0");
    const mm = (dt.getMinutes() + "").padStart(2, "0");
    const ss = (dt.getSeconds() + "").padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  },

  dateFormatConvert(value) {
    if (!value) return "";
    return moment(value).format("YYYY-MM-DD HH:mm:ss");
  },
};

app
  .directive("dialogDrag", dialogDrag)
  .component("font-awesome-icon", FontAwesomeIcon)
  .use(store)
  .use(router)
  .mount("#app");
