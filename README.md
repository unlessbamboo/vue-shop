### 目标

1. 目标

使用前端框架 vue2, vue3, React 进行页面的呈现, 后端微服务使用统一的 Restful 返回值同这些前端项目进行数据交互以实现简单的管理后台. 后端微服务采用 Python, Golang, Java 语言的一些 web 框架进行搭建, 通过前端框架集和后端微服务集的两两组合从而完成 web 知识的广度学习.
当然, 所有后端微服务的 Restful 输入输出都是完全一致的, 设置于所有的后端项目都能共用一个数据库来运行服务.

2. 关联项目

- 个人管理后台: [vue-shop](https://github.com/unlessbamboo/vue-shop)
- 基于 docker, docker-compose 的容器化部署: [deploy-shop](https://github.com/unlessbamboo/deploy-shop)
- 个人导航首页: [webbamboo](https://github.com/unlessbamboo/webbamboo)

### 安装和运行

基础环境信息

- node: node16
- python: python3.11

在下载项目代码之后运行下面的命令进行安装和启动(前提是后端项目已经启动)

```sh
# 安装
npm i
# 启动
npm run serve
```

### 代码说明

1. 别名配置

首先, 在 vue.config.js 中增加 alias 配置, 具体见文件中配置.

另外, 正常的 Vue Component 导入直接使用`@`即可, 但是对于 assets 中的资源导入, 需要使用`~@`来完成.
