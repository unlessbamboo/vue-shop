/*
 * 功能: 请求相关的mixins
 * 变动: 在vue3中取消了mixis, 反而使用ref闭包机制进行替换逻辑.
 */
import { ref } from "vue";

/*
 * 功能: 用于判断请求是否异常
 * NOTE: $eMessage.ElementUI函数
 */
export function checkRequestResult(result, errormsg) {
  if (!result || !result.code) {
    $eMessage.error(errormsg || "响应数据为空, 请检查");
    return false;
  }

  if (result.code != 100000) {
    $eMessage.error(result.message || errormsg);
    return false;
  }
  return true;
}
