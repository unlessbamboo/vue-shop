<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="cateList"
        row-key="id"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :row-class-name="getTableRowClassName"
        class="treetable">
        <!-- 标题 -->
        <el-table-column prop="name" label="分类名称" sortable></el-table-column>
        <!-- 是否有效 -->
        <el-table-column label="是否有效" sortable>
          <template v-slot:default="scope">
            <Icon
              icon="SuccessFilled"
              class="cate-table-icon"
              v-if="scope.row.deleted === false"
              style="color: lightgreen" />
            <Icon icon="CircleCloseFilled" class="cate-table-icon" v-else style="color: red" />
          </template>
        </el-table-column>
        <!-- 级别 -->
        <el-table-column label="等级" sortable>
          <template v-slot:default="scope">
            <el-tag size="small" v-if="scope.row.level === 0">一级</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.level === 1">二级</el-tag>
            <el-tag type="warning" size="small" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" sortable>
          <template v-slot:default="scope">
            <el-button type="primary" :icon="Edit" size="small" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="removeCateById(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" v-model="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="name">
          <el-input v-model="addCateForm.name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改分类名称的对话框 -->
    <el-dialog title="修改分类" v-model="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="name">
          <el-input v-model="editCateForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCateInfo">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="categories">
import { reactive, ref, onMounted, toRefs, computed, getCurrentInstance, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Delete, Edit, Setting, Search, ArrowRight } from "@element-plus/icons-vue";
import SimpleApi from "@/api/simpleApi";
import { ElMessageBox } from "element-plus";
import { checkRequestResult } from "@/mixins/requestCommon";
import categoryMixin from "@/mixins/categoryMixin";

// 全局变量
const { proxy } = getCurrentInstance();
const router = useRouter();

// 复用composition变量
const { cateList, casteProps, cascaderProps, getCateSimpleList } = categoryMixin();

const _state = reactive({
  total: 0, // 总数据条数
  // 查询条件
  queryInfo: {
    level: 3, // 表示获取的最大层级
    page: 1,
    pagesize: 5,
  },

  // 为table指定列的定义，在数据中添加columns
  columns: [
    {
      label: "分类名称",
      prop: "name", // 对应列内容的属性名称
    },
    {
      label: "是否有效",
      type: "template", // 表示将当前列定义为模板列
      template: "isok", // 表示当前这一列使用模板名称
    },
    {
      label: "等级",
      type: "template",
      template: "order",
    },
    {
      label: "操作",
      type: "template",
      template: "opt",
    },
  ],
  addCateDialogVisible: false, // 控制添加分类对话框的显示与隐藏
  // 添加分类的表单数据对象
  addCateForm: {
    name: "", // 将要添加分类的名称
    pid: 0, // 父级分类的id
    level: 0, // 分类的等级，默认添加的是一级分类
  },
  // 添加分类表单的验证规则对象
  addCateFormRules: {
    name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  },
  parentCateList: [], // 父级分类的列表
  selectedKeys: [], // 选中的父级分类的id数组
  editDialogVisible: false, // 控制修改分类名称对话框的显示与隐藏
  editCateForm: {},
});
const {
  total,
  queryInfo,
  columns,
  addCateDialogVisible,
  addCateForm,
  addCateFormRules,
  parentCateList,
  selectedKeys,
  editDialogVisible,
  editCateForm,
} = toRefs(_state);
const addCateFormRef = ref(null);
const editCateFormRef = ref(null);

// --------------- 生命周期 ---------------
onMounted(() => {
  getCateList();
});

// --------------- methods ---------------
// 返回表格行样式
function getTableRowClassName() {
  return "cate-table-cell";
}
// 获取商品分类数据
async function getCateList() {
  const { data: result } = await proxy.$http.get("goods/categories", {
    params: queryInfo.value,
  });
  if (!checkRequestResult(result, "获取商品分类失败！")) {
    return;
  }
  cateList.value = result.data;
  // 为总数据条数赋值
  total.value = result.pager.total;
}
// 监听pagesize改变的事件
function handleSizeChange(newSize) {
  queryInfo.value.pagesize = newSize;
  getCateList(); // 刷新数据
}
// 监听page改变的事件
function handleCurrentChange(newPage) {
  queryInfo.value.page = newPage;
  getCateList();
}
// 点击按钮，显示对话框
function showAddCatDialog() {
  // 先获取父级分类的数据列表
  getParentCateList();
  // 再展示对话框
  addCateDialogVisible.value = true;
}
// 获取父级(2级)分类的数据列表
async function getParentCateList() {
  const { data: result } = await proxy.$http.get("goods/categories/simpleinfo", {
    params: { level: 2 },
  });
  if (!checkRequestResult(result, "获取父级分类数据失败！")) {
    return;
  }
  parentCateList.value = result.data.infos;
}
/*
 * 功能: 选择项发生变化触发
 *  selectKeys数组长度:
 *    + >0，证明选中的父级分类
 *    + =0, 说明没有选中任何父级分类
 */
function parentCateChanged() {
  if (selectedKeys.value.length > 0) {
    addCateForm.value.pid = selectedKeys.value[selectedKeys.value.length - 1];
    addCateForm.value.level = selectedKeys.value.length;
  } else {
    addCateForm.value.pid = 0;
    addCateForm.value.level = 0;
  }
}
// 点击确定按钮添加新的分类
function addCate() {
  addCateFormRef.value.validate(async (valid) => {
    if (!valid) return proxy.$eMessage.error("表单预校验失败！");
    const { data: result } = await proxy.$http.post("goods/categories", addCateForm.value);
    if (!checkRequestResult(result, "添加分类失败！")) {
      return;
    }
    proxy.$eMessage.success("添加分类成功");
    // 刷新列表
    getCateList();
    // 隐藏对话框
    addCateDialogVisible.value = false;
  });
}
// 监听对话框的关闭事件，重置表单数据
function addCateDialogClosed() {
  addCateFormRef.value.resetFields();
  selectedKeys.value = [];
  addCateForm.value.level = 0;
  addCateForm.value.pid = 0;
}
// 展示编辑分类名称的对话框
async function showEditDialog(id) {
  editDialogVisible.value = true;
  const { data: result } = await proxy.$http.get(`goods/categories/${id}`);
  if (!checkRequestResult(result, "查询分类数据失败！")) {
    return;
  }
  editCateForm.value = result.data;
}
// 监听修改分类名称对话框的关闭事件
function editDialogClosed() {
  editCateFormRef.value.resetFields();
}
// 修改分类名称信息，并提交
function editCateInfo() {
  editCateFormRef.value.validate(async (valid) => {
    if (!valid) return;
    // 发起修改分类名称的数据请求
    const { data: result } = await proxy.$http.put(`goods/categories/${editCateForm.value.id}`, {
      name: editCateForm.value.name,
    });
    if (!checkRequestResult(result, "更新分类名称失败！")) {
      return;
    }
    // 关闭对话框
    editDialogVisible.value = false;
    // 重新获取用户列表
    getCateList();
    // 提示修改成功
    proxy.$eMessage.success("更新分类名称成功！");
  });
}
async function removeCateById(id) {
  // 弹框提示用户是否删除数据
  const confirmResult = await ElMessageBox.confirm("此操作将永久删除该分类，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).catch((error) => error);
  if (confirmResult !== "confirm") {
    return proxy.$eMessage.info("已经取消删除");
  }
  const { data: result } = await proxy.$http.delete("goods/categories/" + id);
  if (!checkRequestResult(result, "删除分类失败")) {
    return;
  }
  proxy.$eMessage.success("删除分类成功");
  getCateList();
}
</script>

<style scoped>
.treetable {
  margin-top: 15px;
}

.treetable:deep(.el-table__header-wrapper) {
  overflow: hidden;
}

.treetable:deep(.cate-table-cell) {
  height: 50px;
}
.treetable:deep(.cate-table-icon) {
  height: 20px;
}

.el-cascader {
  width: 100%;
}
</style>
