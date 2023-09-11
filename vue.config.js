const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  publicPath: "./", //部署应用包时的基本 URL
  outputDir: "build/dist", // build构建输出目录, 默认dist
  assetsDir: "static", // 放置生成的静态资源的目录
  indexPath: "index.html", // 指定生成的 index.html 的输出路径, 默认index.html
  productionSourceMap: false,
  devServer: {
    port: 8082,
    host: "127.0.0.1",
    https: false,
    open: false,
  },
  pages: {
    index: {
      entry: "src/main.js",
      title: "bamboo",
    },
  },
  // 设置路径前缀
  chainWebpack: (config) => {
    config.resolve.alias.set("@", resolve("src")); // src目录别名, 对于aseets目录别名, 使用的时候: ~@/assets
  },
};
