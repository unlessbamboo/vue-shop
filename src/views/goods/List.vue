<template>
  <div>
    <!-- 1. 面包屑导航区域 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.name"
            clearable
            @clear="getGoodsList"
            @change="getGoodsList">
            <template v-slot:append>
              <el-button :icon="Search" @click="getGoodsList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="price" width="90px"></el-table-column>
        <el-table-column label="商品重量" prop="weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="create_at" width="145px">
          <template v-slot:default="scope">
            {{ $filters.dateFormat(scope.row.create_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot:default="scope">
            <!-- a. 编辑 -->
            <el-button type="primary" :icon="Edit" size="small" @click="showEditGoodsDialog(scope.row)"></el-button>
            <!-- b. 删除 -->
            <el-button type="danger" :icon="Delete" size="small" @click="removeById(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background></el-pagination>
    </el-card>

    <!-- 3. 添加角色的对话框 -->
    <el-dialog title="修改商品" v-model="editGoodsDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editGoodsForm" :rules="editGoodsFormRules" ref="editGoodsFormRef" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="editGoodsForm.name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input v-model="editGoodsForm.price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="weight">
          <el-input v-model="editGoodsForm.weight"></el-input>
        </el-form-item>
        <el-form-item label="商品描述" prop="introduce">
          <el-input v-model="editGoodsForm.introduce"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="goodslist">
import { reactive, ref, onMounted, toRefs, computed, getCurrentInstance } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Delete, Edit, Setting, Search, ArrowRight } from "@element-plus/icons-vue";
import SimpleApi from "@/api/simpleApi";
import { ElMessageBox } from "element-plus";
import { checkRequestResult } from "@/mixins/requestCommon";

// 全局变量
const { proxy } = getCurrentInstance();
const router = useRouter();

// 查询参数对象
const editGoodsFormRef = ref(null);
const queryInfo = ref({
  name: "",
  page: 1,
  pagesize: 10,
});
// 控制修改商品对话框的显示与隐藏
const editGoodsDialogVisible = ref(false);
const editGoodsForm = ref({ name: "", price: 0, weight: 0.0 });
const editGoodsFormRules = ref({
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  desc: [{ message: "请输入角色描述", trigger: "blur" }],
});
// 商品列表
const goodsList = ref([]);
// 总数据条数
const total = ref(0);

// @funtion: 生命周期
onMounted(() => {
  getGoodsList();
});

// 根据分页获取对应的商品列表
async function getGoodsList() {
  const { data: result } = await proxy.$http.get("goods", {
    params: queryInfo.value,
  });
  if (!checkRequestResult(result, "获取商品列表失败！")) {
    return;
  }
  proxy.$eMessage.success("获取商品列表成功！");
  goodsList.value = result.data;
  total.value = result.pager.total;
}
function handleSizeChange(newSize) {
  queryInfo.value.pagesize = newSize;
  getGoodsList();
}
function handleCurrentChange(newPage) {
  queryInfo.value.page = newPage;
  getGoodsList();
}
async function removeById(id) {
  const confirmResult = await ElMessageBox.confirm("此操作将永久删除该商品, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).catch((error) => error);
  if (confirmResult !== "confirm") {
    return proxy.$eMessage.info("已取消删除！");
  }
  const { data: result } = await proxy.$http.delete(`goods/${id}`);
  if (!checkRequestResult(result, "删除失败！")) {
    return;
  }
  proxy.$eMessage.success("删除成功！");
  getGoodsList();
}
function goAddPage() {
  router.push("/goods/add");
}
/*
 * 功能: 商品编辑
 */
function editGoodsInfo() {
  editGoodsFormRef.value.validate(async (valid) => {
    if (!valid) return;

    const { data: result } = await proxy.$http.put("goods/" + editGoodsForm.value.id, editGoodsForm.value);
    if (!checkRequestResult(result, "更新商品信息失败")) {
      return;
    }
    // 关闭对话框
    editGoodsDialogVisible.value = false;
    // 重新获取用户列表
    getGoodsList();
    // 提示修改成功
    proxy.$eMessage.success("更新角色信息成功");
  });
}
/*
 * 功能: 点击编辑, 将当前行数据复制给editGoodsForm并启动对话框
 */
function showEditGoodsDialog(good) {
  editGoodsDialogVisible.value = true;
  Object.assign(editGoodsForm.value, {
    id: good["id"],
    name: good["name"],
    price: good["price"],
    weight: good["weight"],
    introduce: good["introduce"],
  });
}
</script>

<style scoped></style>
