<template>
  <div>
    <div class="container">
      <!-- gutter 是一种用于设置布局组件之间的间距的属性, 在el-row上表示水平间距 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" class="mgb20" style="height: 252px">
            <div class="user-info">
              <img src="@/assets/img/img.jpg" class="user-avator" alt />
              <div class="user-info-cont">
                <div class="user-info-name">{{ loginName }}</div>
                <div>{{ role }}</div>
              </div>
            </div>
            <div class="user-info-list">
              上次登录时间：
              <span>{{ $filters.dateFormatConvert(loginOther.login_time) }}</span>
            </div>
            <div class="user-info-list">
              上次登录地点：
              <span>{{ loginLocation }}</span>
            </div>
            <div class="user-info-list">
              当前后端服务：
              <span>{{ dynamicBaseURL }}</span>
            </div>
          </el-card>
          <!--
          el-card是一个卡片组件，用于包裹内容，并提供阴影效果
          el-progress是一个进度条组件，用于展示语言的统计百分比

          其中, 各个功能模块说明如下:
            + shadow="hover"属性表示当鼠标悬停在卡片上时显示阴影效果
            + slot自定义el-card的头部，头部显示了"语言详情"文本

          插槽说明: 在使用el-card组件时，我们可以在标签内部插入带有slot="header"
            属性的元素或组件，并且它们将会被渲染到这个插槽的位置。
          注意, el-card本身就要求这样使用slot, 组件内部会自动将这段slot代码作为header.
        -->
          <el-card shadow="hover" style="height: 252px" v-if="statisticsInfo.languages">
            <template v-slot:header>
              <div class="clearfix">
                <span>语言详情</span>
              </div>
            </template>

            <div class="custom-card-content">
              Vue
              <el-progress :percentage="statisticsInfo.languages.vue || 0" color="#42b983"></el-progress>
              Python
              <el-progress :percentage="statisticsInfo.languages.python || 0"></el-progress>
              Golang
              <el-progress :percentage="statisticsInfo.languages.golang || 0" color="#f56c6c"></el-progress>
              JavaScript
              <el-progress :percentage="statisticsInfo.languages.javascript || 0" color="#f1e05a"></el-progress>
              CSS
              <el-progress :percentage="statisticsInfo.languages.css || 0" color="#f1e05a"></el-progress>
            </div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-row :gutter="20" class="mgb20">
            <el-col :span="8">
              <el-card shadow="hover" :body-style="{ padding: '0px' }">
                <div class="grid-content grid-con-1">
                  <i class="el-icon-lx-people grid-con-icon"></i>
                  <div class="grid-cont-right">
                    <div class="grid-num">{{ statisticsInfo.accessNum }}</div>
                    <div>用户访问量</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" :body-style="{ padding: '0px' }">
                <div class="grid-content grid-con-2">
                  <i class="el-icon-lx-notice grid-con-icon"></i>
                  <div class="grid-cont-right">
                    <div class="grid-num">{{ statisticsInfo.msgNum }}</div>
                    <div>系统消息</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" :body-style="{ padding: '0px' }">
                <div class="grid-content grid-con-3">
                  <i class="el-icon-lx-goods grid-con-icon"></i>
                  <div class="grid-cont-right">
                    <div class="grid-num">{{ statisticsInfo.orderNum }}</div>
                    <div>订单数</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <el-card shadow="hover" style="height: 403px" class="todo-card-container">
            <template v-slot:header>
              <div class="clearfix">
                <span>待办事项</span>
                <el-button style="float: right; padding: 3px 0" type="primary" link @click="handleTodoAdd">
                  添加
                </el-button>
              </div>
            </template>
            <el-table :show-header="false" :data="todoList" style="width: 100%">
              <el-table-column width="40">
                <template v-slot:default="scope">
                  <el-checkbox
                    :value="scope.row.status == 3"
                    @change="handleTodoCheckboxChange(scope.row)"></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column>
                <template v-slot:default="scope">
                  <!-- 这里使用方法就是为了调试, 实际问题: 类型不一致, 变为字符串了, 这里提供了一种debug方法 -->
                  <div class="todo-item" :class="{ 'todo-item-del': isTodoItemDel(scope.row.status) }">
                    {{ scope.row.title }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column width="100" align="center">
                <template v-slot:default="scope">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="small"
                    circle
                    @click="handleTodoEdit(scope.row.id, scope.row)"></el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="small"
                    circle
                    @click="handleTodoDelete(scope.row.id, scope.row)"></el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 底部组件 -->
            <div class="todo-action-container">
              <div class="handle-row">
                <el-button type="primary" @click="handleTodoMulComplete">全部标记为完成</el-button>
                <el-button type="primary" @click="handleTodoMulDelete">批量删除已完成事项</el-button>
              </div>
              <el-pagination
                v-if="todoList.length > 0"
                layout="total, sizes, prev, pager, next"
                :total="todoTotal"
                :page-sizes="[5, 10, 20, 50, 100]"
                :page-size="todoPageSize"
                :current-page="todoPage"
                @size-change="handleTodoSizeChange"
                @current-change="handleTodoPageChange"></el-pagination>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- a. 柱状图 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <v-chart :option="salesData.options" theme="ovilia-green" ref="barRef" class="echart" autoresize />
          </el-card>
        </el-col>
        <!-- 折线图 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <v-chart ref="lineRef" class="echart" :options="salesData.options2" />
          </el-card>
        </el-col>
        <!-- 饼状图, 注意, 数据本身就有一定的格式要求 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <v-chart ref="pieRef" class="echart" options="salesData.options3" />
          </el-card>
        </el-col>
        <!-- 环形图 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <v-chart ref="ringRef" class="echart" :options="salesData.options4" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 2. 编辑弹出框, 注意el-form-item中的prop实际上和rules中的key对应 -->
    <el-dialog title="编辑" v-model="todoEditDialogVisible" width="30%">
      <el-form ref="todoEditFormRef" :model="todoEditForm" label-width="70px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="todoEditForm.title"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea" v-model="todoEditForm.desc"></el-input>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input v-model="todoEditForm.priority"></el-input>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="todoEditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveTodoEdit">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 3. 添加弹出框, 注意el-form-item中的prop实际上和rules中的key对应 -->
    <el-dialog title="添加" v-model="todoAddDialogVisible" width="30%">
      <el-form ref="todoAddFormRef" :model="todoAddForm" label-width="70px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="todoAddForm.title"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea" v-model="todoAddForm.desc"></el-input>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input v-model="todoAddForm.priority"></el-input>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="todoAddDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveTodoAdd">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="dashboard">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  onBeforeMount,
  onActivated,
  onDeactivated,
  computed,
  watch,
} from "vue";
import { ElMessageBox } from "element-plus";
import "@/utils/chart";
import VChart, { THEME_KEY } from "vue-echarts";

import SimpleApi from "@/api/simpleApi";
import Axiosapi from "@/utils/request";
import { checkRequestResult } from "@/mixins/requestCommon";
import CommonDateHandler from "@/utils/date";

// 全局变量
const { proxy } = getCurrentInstance();
const $mitt = proxy.$mitt;

/*
页面: 管理后台控制台首页
 */
const dynamicBaseURL = ref(Axiosapi.dynamicURL);
const loginName = localStorage.getItem("ms_username");
const loginOther = JSON.parse(localStorage.getItem("ms_other"));

const todoList = ref([]);
const todoPage = ref(1);
const barRef = ref(null);
const lineRef = ref(null);
const pieRef = ref(null);
const ringRef = ref(null);
const refreshInterval = ref(null);
const todoPageSize = ref(5);
const todoTotal = ref(0);
const todoEditDialogVisible = ref(false);
const todoHandleId = ref(0);
const todoEditForm = ref({});
const todoAddDialogVisible = ref(false);
const todoAddForm = ref({ title: "", desc: "", priority: 3 });
const salesData = ref({ options: {}, options2: {}, options3: {}, options4: {} });
const statisticsInfo = ref({});

/*
Computed: 计算属性
*/
const role = computed(() => (loginName === "admin" ? "超级管理员" : "普通用户"));
const loginLocation = computed(() => {
  if (!loginOther.login_location) {
    return "-";
  }
  return `${loginOther.login_location.city} / ${loginOther.login_location.country}`;
});
/*
Lifecycle: 事件方法和生命周期
*/
onBeforeMount(() => {
  getAllInfo();
  $mitt.on("dynamicURLChange", handleDynamicURLChange); // 监听事件总线的某一个值
});
onBeforeUnmount(() => {
  $mitt.off("dynamicURLChange", handleDynamicURLChange); // 取消监听
});
// 当点击"系统首页", 加载dashboard页面的时候, 该函数被调用
onActivated(() => {
  getAllInfo();
  refreshInterval.value = setInterval(() => {
    getAllInfo();
  }, 60000);
});
// 功能: 当离开dashboard页面的时候被调用
onDeactivated(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

/*
Methods:
*/
function handleDynamicURLChange(newDynamicURLValue) {
  dynamicBaseURL.value = newDynamicURLValue;
}
function isTodoItemDel(status) {
  return parseInt(status) === 3;
}
// 注意, 在请求期间, 数据仍然是初始状态, 所以html中需要兼容
function getAllInfo() {
  getTodoListInfos();
  getRecentSalesData();
  getStatisticsInfo();
}
// 自定义事件的方法。当"collapse"事件被触发时调用: 重新渲染图表
function handleBus(msg) {
  setTimeout(() => {
    renderChart();
  }, 200);
}
// 用于渲染图表的方法: 重新渲染柱状图, 重新渲染折线图
function renderChart() {
  barRef.value.renderChart();
  lineRef.value.renderChart();
}

function handleTodoSizeChange(pageSize) {
  todoPageSize.value = pageSize;
  getStatisticsInfo();
}
function handleTodoPageChange(page) {
  todoPage.value = page;
  getStatisticsInfo();
}

// 获取todolist
function getTodoListInfos() {
  SimpleApi.fetchTodoListInfos()
    .then((result) => {
      var _rspInfo = result.data;
      if (!checkRequestResult(_rspInfo, "获取todolist列表异常")) {
        return;
      }
      todoList.value = _rspInfo.data;
      todoPage.value = _rspInfo.pager.page;
      todoPageSize.value = _rspInfo.pager.pageSize;
      todoTotal.value = _rspInfo.pager.total;
    })
    .catch((error) => {
      console.log(error);
    });
}
function handleTodoEdit(todoId, row) {
  todoHandleId.value = todoId;
  const { id, title, desc, priority } = row;
  todoEditForm.value = { id, title, desc, priority };
  todoEditDialogVisible.value = true;
}
async function handleTodoDelete(todoId, row) {
  try {
    await ElMessageBox.confirm("确定要标记为删除吗？", "提示", {
      type: "warning",
    });
    const { data: result } = await SimpleApi.UpdateTodoOneInfos(todoId, {
      status: 4,
    });
    if (!checkRequestResult(result, "更新todo信息失败")) {
      return;
    }
    getTodoListInfos();
  } catch (error) {
    console.error("删除操作取消或出错:", error);
  }
}
async function saveTodoEdit() {
  // 发起修改用户信息的数据请求
  const { data: result } = await SimpleApi.UpdateTodoOneInfos(todoEditForm.value.id, todoEditForm);
  if (!checkRequestResult(result, "更新todo信息失败")) {
    return;
  }
  todoEditDialogVisible.value = false;
  getTodoListInfos();
  $eMessage.success("更新todo信息成功");
}
// 在勾选或取消勾选待办实现的时候触发回调
async function handleTodoCheckboxChange(row) {
  status = row.status == 3 ? 1 : 3;

  const { data: result } = await SimpleApi.UpdateTodoOneInfos(row.id, { status: parseInt(status) });
  if (!checkRequestResult(result, `更新待办事项(${row.title})信息失败`)) {
    return;
  }

  // 这种数组内的数据刷新不会触发自动刷新, 需要手动处理(注意status的类型)
  this.$set(row, "status", status);
}
// 添加新的代办事项
function handleTodoAdd() {
  todoAddForm.value = { title: "", desc: "", priority: 3 };
  todoAddDialogVisible.value = true;
}
async function saveTodoAdd() {
  // 发起修改用户信息的数据请求
  const { data: result } = await $http.post("other/todos", todoAddForm.value);
  if (!checkRequestResult(result, "添加新待办事项失败")) {
    return;
  }
  todoAddDialogVisible.value = false;
  getTodoListInfos();
  $eMessage.success("更新todo信息成功");
}
// 批量更新待办事项状态
async function updateTodoStatus(status) {
  const { data: result } = await $http.put(`other/todos/status/${status}`);
  if (!checkRequestResult(result, "添加新待办事项失败")) {
    return;
  }
}
function handleTodoMulComplete() {
  updateTodoStatus(3);
  getTodoListInfos();
}
function handleTodoMulDelete() {
  updateTodoStatus(4);
  getTodoListInfos();
}

// 获取最近一周各品类销售数据
function getRecentSalesData() {
  // 获取最近一周的日期范围，可以使用 JavaScript Date 对象进行计算
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 格式化日期范围为字符串，如果需要传给 API 的话
  const startDate = CommonDateHandler.formatDate(oneWeekAgo);
  const endDate = CommonDateHandler.formatDate(today);

  // 调用 API 方法获取最近一周的销售数据
  SimpleApi.fetchSalesData({ startDate, endDate })
    .then((result) => {
      var _rspInfo = result.data;
      if (!checkRequestResult(_rspInfo, "获取最近一周各品类销售数据异常")) {
        return;
      }
      salesData.value = _rspInfo.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

// 获取网站的统计信息
function getStatisticsInfo() {
  SimpleApi.fetchStatisticsData()
    .then((result) => {
      var _rspInfo = result.data;
      if (!checkRequestResult(_rspInfo, "获取网站的统计信息异常")) {
        return;
      }
      statisticsInfo.value = _rspInfo.data;
    })
    .catch((error) => {
      console.log(error);
    });
}
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

/* 调整el-card中的字体大小和行高 */
.custom-card-content {
  font-size: 15px;
  line-height: 1;
}

.grid-content {
  display: flex;
  align-items: center;
  height: 100px;
}

.grid-cont-right {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.grid-num {
  font-size: 30px;
  font-weight: bold;
}

.grid-con-icon {
  font-size: 50px;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  color: #fff;
}

.grid-con-1 .grid-con-icon {
  background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
  color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
  background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
  color: rgb(45, 140, 240);
}

.grid-con-3 .grid-con-icon {
  background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
  color: rgb(242, 94, 67);
}

.user-info {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #ccc;
  margin-bottom: 10px;
}

.user-avator {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.user-info-cont {
  padding-left: 50px;
  flex: 1;
  font-size: 14px;
  color: #999;
}

.user-info-cont div:first-child {
  font-size: 30px;
  color: #222;
}

.user-info-list {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
  line-height: 25px;
}

.user-info-list span {
  margin-left: 0px;
}

.mgb20 {
  margin-bottom: 20px;
}

/* 确保分页栏一直在最下方, 使用flex布局, 然后el-table设置为flex:1, 这样会使el-table占用所有可用垂直空间 */
.todo-card-container {
  display: flex;
  flex-direction: column;
}
.todo-card-container:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.todo-card-container:deep(.el-table) {
  flex: 1;
}
.todo-item {
  font-size: 14px;
}

.todo-item-del {
  text-decoration: line-through;
  color: #999;
}
.todo-action-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
}

.echart {
  /* width: 100%; */
  height: 300px;
}
</style>
