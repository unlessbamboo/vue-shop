/*
 * 功能: 商品管理-商品分类下的几个通用函数
 */

export default {
  data() {
    return {
      cateList: [], // 商品分类列表
      // 指定级联选择器的配置对象
      casteProps: {
        expandTrigger: "hover",
        value: "id",
        label: "name",
        children: "children",
      },
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "id",
        label: "name",
        children: "children",
        checkStrictly: true,
      },
    };
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateSimpleList() {
      const { data: result } = await this.$http.get("goods/categories/simpleinfo");
      if (!this.checkRequestResult(result, "获取商品分类列表失败！")) {
        return;
      }
      this.cateList = result.data.infos;
    },
  },
};
