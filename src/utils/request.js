import axios from "axios";

const baseDefault = process.env.VUE_APP_FLASK_BACKEND_HOST;

// 创建一个 Axios 实例，可以在这里配置默认的请求头、请求拦截器、响应拦截器等
const service = axios.create({
  baseURL: baseDefault + "/api/v1/", // 设置基础URL，根据实际情况进行更改
  timeout: 5000, // 设置请求超时时间，单位为毫秒
  withCredentials: true, // 设置跨域请求时是否需要使用凭证
});

// 请求拦截器
service.interceptors.request.use(
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
service.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response; // 对响应数据做些什么，例如处理错误状态码、数据转换等
    } else {
      Promise.reject();
    }
  },
  (error) => {
    console.log(error);
    return Promise.reject();
  },
);

// 动态获取uploadURL
Object.defineProperty(service, "uploadURL", {
  get: function () {
    const sessionBaseHost = window.sessionStorage.getItem("shopDynamicHost");
    return sessionBaseHost || defaultHost;
  },
});

Object.defineProperty(service, "dynamicURL", {
  get: function () {
    var oldBaseHost = process.env.VUE_APP_FLASK_BACKEND_HOST;
    const sessionBaseHost = window.sessionStorage.getItem("shopDynamicHost");
    if (sessionBaseHost) {
      oldBaseHost = sessionBaseHost;
    }
    return oldBaseHost;
  },
});

export default service;
