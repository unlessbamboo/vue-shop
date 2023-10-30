/*
 * 通用消息
 */
import { ElMessage } from "element-plus";

const customMessage = {};

// 定义 error 方法
customMessage.error = (options) => {
  if (typeof options === "string") {
    options = {
      message: options,
      type: "error", // 类型: 错误, 成功, 告警灯
    };
  }
  ElMessage(options);
};

// 定义 success 方法
customMessage.success = (options) => {
  if (typeof options === "string") {
    options = {
      message: options,
      type: "success",
    };
  }
  ElMessage(options);
};

// 定义 success 方法
customMessage.warning = (options) => {
  if (typeof options === "string") {
    options = {
      message: options,
      type: "warning",
    };
  }
  ElMessage(options);
};

// 使用 Object.defineProperty 确保属性不可重写
Object.defineProperty(customMessage, "error", {
  value: customMessage.error,
  writable: false,
});
Object.defineProperty(customMessage, "success", {
  value: customMessage.success,
  writable: false,
});
Object.defineProperty(customMessage, "warning", {
  value: customMessage.warning,
  writable: false,
});

export default customMessage;
