<template>
  <div>
    <!-- 1. 面包屑导航栏 -->
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <Icon icon="Grid" class="shopIcon" />
          基础表格
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 2. 表格 -->
    <div class="container">
      <!-- a. 动作和搜索栏: el-button, el-select, el-input, el-button -->
      <div class="handle-box">
        <el-button
          type="primary"
          :icon="Delete"
          class="handle-del mr10"
          @click="delAllSelection"
          :disabled="checkAtLeastOneSelected">
          批量删除
        </el-button>
        <el-select v-model="searchForm.address" placeholder="地址" class="handle-select mr10">
          <el-option key="1" label="广东省" value="广东省"></el-option>
          <el-option key="2" label="湖南省" value="湖南省"></el-option>
        </el-select>
        <el-input v-model="searchForm.username" placeholder="用户名" class="handle-input mr10"></el-input>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      </div>

      <!-- b. 表格列表
        selection: 表示该列是一个选择列, 该列会在表格的每一行前显示一个复选框，用于进行多选操作
        el-table-column: 用于定义 <el-table> 中的列
          + prop: 列对应的数据字段名
          + label: 列的标题
          + width: 列的宽度
          + align: 对齐方式
      -->
      <el-table
        :data="personInfoList"
        border
        table-layout="auto"
        class="person-table"
        ref="multipleTable"
        header-cell-class-name="table-header"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>

        <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="nickname" label="昵称"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="address" label="详细地址"></el-table-column>
        <el-table-column prop="roleinfo.name" label="角色"></el-table-column>

        <!-- 通过v-slot:default属性来获取当前行数据，并根据confirmed字段的值来展示不同类型的标签
            success: 绿色
            danger: 红色
            其他
          <el-table-column label="状态" align="center">
            <template v-slot:default="scope">
              <el-tag :type="scope.row.confirmed === true ? 'success' : scope.row.state === false ? 'danger' : ''">
                {{ scope.row.confirmed }}
              </el-tag>
            </template>
          </el-table-column>
        -->
        <el-table-column label="状态" width="75">
          <!-- 作用域插槽 会覆盖prop -->
          <template v-slot:default="scope">
            <el-switch v-model="scope.row.confirmed" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <el-table-column prop="create_at" label="注册时间" :class-name="'person-date-column'">
          <template v-slot:default="scope">
            {{ scope.row.create_at }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center">
          <template v-slot:default="scope">
            <!-- type决定了图标的背景 -->
            <el-button
              type="primary"
              :icon="Edit"
              size="small"
              circle
              @click="handleEdit(scope.$index, scope.row)"></el-button>
            <el-button
              type="danger"
              :icon="Delete"
              size="small"
              circle
              @click="handleDelete(scope.$index, scope.row)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                :icon="Setting"
                size="small"
                circle
                @click="getEnableRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- c. 分页, el-pagination: 用于实现分页功能,
          background: 是否显示背景色
          layout: 分页布局，可以自定义显示的内容和顺序
            + total: 总页数
            + sizes: 每页格式选择
            + prev, pager, next: 标准页面跳转
            + jumper: 手动跳转

          size-change: 每页的个数
          current-page: 当前页码
          total: 总条数

          page-size: 每页显示的数据条数, 注意page-size和page-sizes的不同
      -->
      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageTotal"
          :page-sizes="[10, 50, 100]"
          :page-size="searchForm.pagesize"
          :current-page="searchForm.pagenum"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"></el-pagination>
      </div>
    </div>

    <!-- 3. 编辑弹出框, 注意el-form-item中的prop实际上和rules中的key对应 -->
    <el-dialog title="编辑" v-model="editDialogVisible" width="30%">
      <el-form ref="editFormRef" :model="editForm" :rules="addFormRules" label-width="70px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="editForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="editForm.address"></el-input>
        </el-form-item>
      </el-form>

      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveEdit">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 4. 分配角色的对话框 -->
    <el-dialog title="分配角色" v-model="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{ selectUserInfo.username }}</p>
        <p>当前角色：{{ selectUserInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <!-- 底部区域 -->
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInf">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="userinfos">
import { reactive, ref, onMounted, toRefs, computed, getCurrentInstance } from "vue";
import SimpleApi from "@/api/simpleApi";
import { ElMessageBox, ElMessage } from "element-plus";
import { Delete, Edit, Setting, Search } from "@element-plus/icons-vue";
import { checkRequestResult } from "@/mixins/requestCommon";

// 验证手机号的正则表达式
const regMoblie = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
// 验证手机号的规则函数
const checkMoblie = (rule, value, callback) => {
  if (regMoblie.test(value)) {
    callback();
  } else {
    callback(new Error("请输入合法的手机号"));
  }
};
// 全局变量
const { proxy } = getCurrentInstance();

// Setup reactive state
const state = reactive({
  searchForm: {
    // 用户搜索表单
    address: "",
    username: "",
    email: "",
    phone: "",
    pagenum: 1,
    pagesize: 10,
  },
  personInfoList: [],
  multipleSelection: [],
  delList: [],
  editDialogVisible: false, // 是否显示用户信息编辑对话框
  selectUserInfo: {}, // 当前被选择的待操作的用户信息
  selectedRoleId: "",
  rolesList: [], // 可选角色列表
  setRoleDialogVisible: false, // 是否显示角色设置对话框
  pageTotal: 0,
  idx: -1,
  id: -1,
  editForm: {},
  // 将验证规则定义在setup外部，因为它们不需要是响应式的
  addFormRules: {
    username: [
      { required: true, message: "请输入用户名", trigger: "blur" },
      { min: 3, max: 10, message: "用户名的长度在3-10个字符之间", trigger: "blur" },
    ],
    password: [
      { required: true, message: "请输入密码", trigger: "blur" },
      { min: 6, max: 15, message: "密码的长度在6-15个字符之间", trigger: "blur" },
    ],
    email: [
      { required: true, message: "请输入邮箱", trigger: "blur" },
      { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] },
    ],
    phone: [
      { message: "请输入手机号", trigger: "blur" },
      { validator: checkMoblie, trigger: "blur" },
    ],
  },
});

// Convert state to refs
const {
  searchForm,
  personInfoList,
  multipleSelection,
  delList,
  editDialogVisible,
  selectUserInfo,
  selectedRoleId,
  rolesList,
  setRoleDialogVisible,
  pageTotal,
  idx,
  id,
  editForm,
  addFormRules,
} = toRefs(state);
const editFormRef = ref(null);

// @funtion: 生命周期
onMounted(() => {
  getUserList();
});
const checkAtLeastOneSelected = computed(() => {
  // 判断是否至少选中了一项, 若未选中任何项则不可进行批量删除操作
  return multipleSelection.value.length === 0;
});

// 获取 easy-mock 的模拟数据
function getUserList() {
  SimpleApi.fetchPersonInfos(searchForm.value).then((res) => {
    const { data: result } = res;
    if (!checkRequestResult(result, "获取用户列表异常")) {
      return;
    }
    personInfoList.value = result.data;
    pageTotal.value = result.pager.total || 0;
  });
}
// 展示分配角色的对话框
async function getEnableRoles(userInfo) {
  selectUserInfo.value = userInfo;
  // 在展示对话框之前获取所有角色的列表
  const { data: result } = await proxy.$http.get("auth/roles");
  if (!checkRequestResult(result, "获取角色列表失败！")) {
    return;
  }
  proxy.$eMessage.success("获取角色列表成功！");
  rolesList.value = result.data;
  setRoleDialogVisible.value = true;
}
// 监听分配角色对话框的关闭事件
function setRoleDialogClosed() {
  selectedRoleId.value = "";
  selectUserInfo.value = {};
}
// 点击按钮分配角色
async function saveRoleInf() {
  if (!selectedRoleId.value) {
    return proxy.$eMessage.error("请选择一个角色！");
  }
  const { data: result } = await proxy.$http.put(`auth/users/${selectUserInfo.value.id}/role`, {
    role_id: selectedRoleId.value,
  });
  if (!checkRequestResult(result, "更新角色失败！")) {
    return;
  }
  proxy.$eMessage.success("更新角色成功！");
  // 刷新当前角色列表
  getUserList();
  // 隐藏当前分配角色对话框
  setRoleDialogVisible.value = false;
}

// 触发搜索按钮
function handleSearch() {
  searchForm.value.pagenum = 1;
  getUserList();
}
// 删除操作
function handleDelete(index, row) {
  // 二次确认删除
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    type: "warning",
  })
    .then(() => {
      proxy.$eMessage.success("删除成功");
      var item = personInfoList.value.splice(index, 1);
      if (item) {
        // 将选项框中的匹配元素也剔除
        multipleSelection.value = multipleSelection.value.filter((obj) => obj.id !== item.id);
      }
    })
    .catch(() => {});
}
/*
  勾选操作, 其有如下几个情况:
  + 勾选单个, 该选项之前未选中, 此时vals传入包含当前已勾选元素(可能多个)的数组
  + 勾选单个, 该选项之前已选中, 此时vals传入除当前项之外已勾选元素的数组
  + 勾选批量按钮, 类似上面的逻辑
*/
function handleSelectionChange(vals) {
  multipleSelection.value = vals;
}
function delAllSelection() {
  const length = multipleSelection.value.length;
  if (length === 0) {
    proxy.$eMessage.error("未选中任何项, 无法进行批量删除操作, 请检查");
    return;
  }
  let str = "";
  delLis.valuet = delLis.valuet.concat(multipleSelection.value);
  for (let i = 0; i < length; i++) {
    str += multipleSelection.value[i].username + " ";
  }
  proxy.$eMessage.error(`删除了${str}`);
  multipleSelection.value = [];
}
// 编辑操作
function handleEdit(index, row) {
  idx.value = index;
  const { id, nickname, phone, address } = row;
  editForm.value = { id, nickname, phone, address };
  editDialogVisible.value = true;
}
// 保存编辑
function saveEdit() {
  editFormRef.value.validate(async (valid) => {
    if (!valid) return;
    // 发起修改用户信息的数据请求
    const { data: result } = await proxy.$http.put("auth/users/" + editForm.value.id, editForm.value);
    if (!checkRequestResult(result, "更新用户失败")) {
      return;
    }
    // 关闭对话框
    editDialogVisible.value = false;
    // 重新获取用户列表
    getUserList();
    // 提示修改成功
    proxy.$eMessage.success("更新用户信息成功");
  });
}

// 分页导航
function handlePageChange(val) {
  searchForm.value.pagenum = val;
  getUserList();
}
function handleSizeChange(pageSize) {
  searchForm.value.pagesize = pagesize;
  getUserList();
}
// 监听switch开关状态的改变
async function userStateChange(userinfo) {
  // 发送请求进行状态修改
  const { data: result } = await proxy.$http.put(`auth/users/${userinfo.id}/state`, {
    confirmed: userinfo.confirmed ? 1 : 0,
  });
  if (!checkRequestResult(result, "更新用户状态失败")) {
    userinfo.confirmed = !userinfo.confirmed;
    return;
  }
  proxy.$eMessage.success("更新用户状态成功");
}
</script>

<style>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
  display: inline-block;
}
.person-table {
  width: 100%;
  font-size: 14px;
}
.red {
  color: #ff0000;
}
.mr10 {
  margin-right: 10px;
}
.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}

/* 注册时间单元格样式 */
td.person-date-column div {
  white-space: nowrap !important; /* 防止日期字符串换行 */
  overflow: hidden; /* 溢出部分隐藏 */
  text-overflow: ellipsis; /* 超出部分以省略号表示 */
  font-size: 12px; /* 初始字体大小 */
}
</style>
