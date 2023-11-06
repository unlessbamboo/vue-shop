import {fileURLToPath, URL} from "node:url";

import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
// JavaScript 编译器: 将ES6+转换为ES5, 兼容相关代码, 源码映射, 集成工具链
import babel from "vite-plugin-babel";
import vueSetupExtend from "vite-plugin-vue-setup-extend"; // 引入插件

export default defineConfig({
  plugins: [babel(), vue(), vueSetupExtend()],
  base: "./", // 部署应用包时的基本 URL
  logLevel: "info", // 控制台输出级别
  build: {
    // minify: false, // 禁用代码混淆(一般不开启)
    outDir: "build/dist", // build构建输出目录, 默认dist
    assetsDir: "static", // 指定生成静态资源的存放路径, 相对于build.outDir
    chunkSizeWarningLimit: 2000, // 将限制提高到 2000 KB
    // 自定义底层的 Rollup 打包配置
    rollupOptions: {},
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)), // src目录别名
    },
  },
  server: {
    port: 8082,
    host: "127.0.0.1",
    https: false,
    open: false,
  },
});
