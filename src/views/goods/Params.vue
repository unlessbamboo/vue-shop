<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="casteProps"
            @change="handleChange"
            clearable></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- a. 添加参数按钮 -->
          <el-button type="primary" size="small" :disabled="isBtnDisabled" @click="addDialogVisible = true">
            添加参数
          </el-button>

          <!-- b. 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.values"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInputRef"
                  size="small"
                  @keyup.enter="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="name"></el-table-column>
            <el-table-column label="参数值" prop="values"></el-table-column>
            <el-table-column label="操作" width="200px">
              <template v-slot:default="scope">
                <el-button type="primary" :icon="Edit" size="small" @click="showEditDialog(scope.row.id)">
                  编辑
                </el-button>
                <el-button type="danger" :icon="Delete" size="small" @click="removeParams(scope.row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button type="primary" size="small" :disabled="isBtnDisabled" @click="addDialogVisible = true">
            添加属性
          </el-button>

          <!-- 动态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.values"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)">
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInputRef"
                  size="small"
                  @keyup.enter="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="name"></el-table-column>
            <el-table-column label="参数值" prop="values"></el-table-column>
            <el-table-column label="操作" width="200px">
              <template v-slot:default="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row.id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="removeParams(scope.row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog :title="`添加${titleText}`" v-model="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="name">
          <el-input v-model="addForm.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="参数值" prop="values">
          <el-input v-model="addForm.values" placeholder="逗号分割的值"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog :title="`修改${titleText}`" v-model="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="`${titleText}`" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="参数值" prop="values">
          <el-input v-model="editForm.values" placeholder="逗号分割的值"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="params">
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

// 级联选择框双向绑定到的数组
const selectedCateKeys = ref([]);
// 被激活的页签名称
const activeName = ref("many");
// 动态参数的数据
const manyTableData = ref([]);
// 静态属性的数据
const onlyTableData = ref([]);
// 控制添加对话框的显示与隐藏
const addDialogVisible = ref(false);
// 添加参数的表单数据对象
const addForm = ref({
  name: "",
});
// 添加表单的验证对象
const addFormRules = ref({
  name: [{ required: true, message: "请输入参数名称", trigger: "blur" }],
  values: [{ required: true, message: "请输入参数值(逗号分割)", trigger: "blur" }],
});
// 控制修改对话框的显示与隐藏
const editDialogVisible = ref(false);
// 修改的表单数据对象
const editForm = ref({});
const addFormRef = ref(null);
const editFormRef = ref(null);

// @function: 声明周期
onMounted(() => {
  getCateSimpleList();
});
// ----------------computed-------------------
// 如果按钮需要被禁用，返回true，否则返回false
const isBtnDisabled = computed(() => {
  if (selectedCateKeys.value.length !== 3) {
    return true;
  }
  return false;
});
// 当前选中的三级分类的id
const cateId = computed(() => {
  if (selectedCateKeys.value.length === 3) {
    return selectedCateKeys.value[2];
  }
  return null;
});
// 动态计算标题的文本
const titleText = computed(() => {
  if (activeName.value === "many") {
    return "动态参数";
  }
  return "静态属性";
});

// ----------------methods-------------------
// 级联选择框选中项变化会触发这个函数
function handleChange() {
  getParamsData();
}
// Tab页签点击事件的处理函数
function handleTabClick() {
  getParamsData();
}
// 获取参数的列表数据
async function getParamsData() {
  // 选中的不是三级分类，就重置数组
  if (selectedCateKeys.value.length !== 3) {
    selectedCateKeys.value = [];
    manyTableData.value = [];
    onlyTableData.value = [];
  }
  // 选中的是三级分类, 根据所选分类的id和当前所处的面板，获取对应的参数
  if (!cateId.value) {
    return;
  }
  const { data: result } = await proxy.$http.get(`goods/categories/${cateId.value}/attributes`, {
    params: { select: activeName.value },
  });
  if (!checkRequestResult(result, "获取参数列表失败")) {
    return;
  }

  result.data.forEach((item) => {
    item.values = item.values ? item.values.split(" ") : [];
    // 添加一个布尔值，控制文本框的显示与隐藏
    item.inputVisible = false;
    // 文本框中输入的值
    item.inputValue = "";
  });

  if (activeName.value === "many") {
    manyTableData.value = result.data;
  } else {
    onlyTableData.value = result.data;
  }
}
// 监听添加对话框的关闭事件
function addDialogClosed() {
  addFormRef.value.resetFields();
}
// 点击按钮添加参数
function addParams() {
  addFormRef.value.validate(async (valid) => {
    if (!valid) return;
    const { data: result } = await proxy.$http.post(`goods/categories/${cateId.value}/attributes`, {
      name: addForm.value.name,
      values: addForm.value.values,
      select: activeName.value,
    });
    if (!checkRequestResult(result, "添加参数失败")) {
      return;
    }
    proxy.$eMessage.success("添加参数成功！");
    addDialogVisible.value = false;
    getParamsData();
  });
}
// 点击按钮展示修改的对话框
async function showEditDialog(id) {
  const { data: result } = await proxy.$http.get(`goods/categories/${cateId.value}/attributes/${id}`, {
    params: { select: activeName.value },
  });
  if (!checkRequestResult(result, "获取参数失败！")) {
    return;
  }
  editForm.value = result.data;
  editDialogVisible.value = true;
}
// 监听修改对话框的关闭事件
function editDialogClosed() {
  editFormRef.value.resetFields();
}
// 点击按钮修改参数
function editParams() {
  editFormRef.value.validate(async (valid) => {
    if (!valid) return;
    const { data: result } = await proxy.$http.put(`goods/categories/${cateId.value}/attributes/${editForm.value.id}`, {
      name: editForm.value.name,
      select: activeName.value,
    });
    if (!checkRequestResult(result, "修改参数失败！")) {
      return;
    }
    proxy.$eMessage.success("修改参数成功！");
    getParamsData();
    editDialogVisible.value = false;
  });
}
// 根据id删除参数
async function removeParams(id) {
  const confirmResut = await ElMessageBox.confirm("此操作将永远删除该参数，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).catch((err) => err);

  if (confirmResut !== "confirm") {
    return proxy.$eMessage.info("已取消删除");
  }
  // 删除
  const { data: result } = await proxy.$http.delete(`goods/categories/${cateId.value}/attributes/${id}`);
  if (!checkRequestResult(result, "删除属性失败！")) {
    return;
  }
  proxy.$eMessage.success("删除属性成功！");
  getParamsData();
}
// 文本框失去焦点，或按下Enter键，都会触发
function handleInputConfirm(row) {
  if (row.inputValue.trim().length === 0) {
    row.inputValue = "";
    row.inputVisible = false;
    return;
  }
  // 如果没有return，则说明有输入的内容，需要做后续的处理
  row.values.push(row.inputValue.trim());
  row.inputValue = "";
  row.inputVisible = false;
  saveAttrVals(row);
}
// 点击按钮，展示文本输入框
function showInput(row) {
  row.inputVisible = true;
  // 让文本框自动获得焦点
  // $nextTick方法作用： 当页面上元素被重新渲染之后，才会执行回调函数中的代码
  nextTick((_) => {
    saveTagInputRef.value.input.focus();
  });
}
// 删除对应的参数可选项
function handleClose(i, row) {
  row.values.splice(i, 1);
  saveAttrVals(row);
}
// 将对 values的操作，保存到数据库
async function saveAttrVals(row) {
  // 需要发起请求保存操作
  const { data: result } = await proxy.$http.put(`goods/categories/${cateId.value}/attributes/${row.id}`, {
    name: row.name,
    select: row.select,
    values: row.values.join(" "),
  });
  if (!checkRequestResult(result, "修改参数项失败！")) {
    return;
  }
  proxy.$eMessage.success("修改参数项成功！");
}
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
