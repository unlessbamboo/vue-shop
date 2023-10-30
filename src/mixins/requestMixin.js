/*
 * 功能: 请求相关的mixins
 */

export default {
  methods: {
    /*
     * 功能: 用于判断请求是否异常
     * NOTE: $eMessage.ElementUI函数
     */
    checkRequestResult(result, errormsg) {
      if (!result || !result.code) {
        $eMessage.error(errormsg || "响应数据为空, 请检查");
        return false;
      }

      if (result.code != 100000) {
        $eMessage.error(result.message || errormsg);
        return false;
      }
      return true;
    },
  },
};
