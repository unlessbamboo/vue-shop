/*
 * 功能: 请求相关的mixins
 */

export default {
  methods: {
    /*
     * 功能: 用于判断请求是否异常
     * NOTE: this.$message是ElementUI函数
     */
    checkRequestResult(result, errormsg) {
      if (!result || !result.code) {
        this.$message.error(errormsg || "响应数据为空, 请检查");
        return false;
      }

      if (result.code != 100000) {
        this.$message.error(result.message || errormsg);
        return false;
      }
      return true;
    },
  },
};
