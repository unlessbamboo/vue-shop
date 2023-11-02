/*
 * 功能: 商品管理-商品分类下的几个通用函数
 * NOTE: 新版本使用composition替代mixins
 */
import { ref, getCurrentInstance } from "vue";
import { checkRequestResult } from "@/mixins/requestCommon";

export default function () {
  const { proxy } = getCurrentInstance();
  const cateList = ref([]); // 商品分类列表
  // 指定级联选择器的配置对象
  const casteProps = ref({
    expandTrigger: "hover",
    value: "id",
    label: "name",
    children: "children",
  });
  // 指定级联选择器的配置对象
  const cascaderProps = ref({
    expandTrigger: "hover",
    value: "id",
    label: "name",
    children: "children",
    checkStrictly: true,
  });

  // 获取所有的商品分类列表
  async function getCateSimpleList() {
    const { data: result } = await proxy.$http.get("goods/categories/simpleinfo");
    if (!checkRequestResult(result, "获取商品分类列表失败！")) {
      return;
    }
    cateList.value = result.data.infos;
  }

  return {
    cateList,
    casteProps,
    cascaderProps,
    getCateSimpleList,
  };
}
