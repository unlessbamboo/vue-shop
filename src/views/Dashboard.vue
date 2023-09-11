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
              <span>{{ loginOther.login_time | dateFormatConvert }}</span>
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
            <div slot="header" class="clearfix">
              <span>语言详情</span>
            </div>
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
            <div slot="header" class="clearfix">
              <span>待办事项</span>
              <el-button style="float: right; padding: 3px 0" type="text" @click="handleTodoAdd">添加</el-button>
            </div>
            <el-table :show-header="false" :data="todoList" style="width: 100%">
              <el-table-column width="40">
                <template slot-scope="scope">
                  <el-checkbox
                    :value="scope.row.status == 3"
                    @change="handleTodoCheckboxChange(scope.row)"></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column>
                <template slot-scope="scope">
                  <!-- 这里使用方法就是为了调试, 实际问题: 类型不一致, 变为字符串了, 这里提供了一种debug方法 -->
                  <div class="todo-item" :class="{ 'todo-item-del': isTodoItemDel(scope.row.status) }">
                    {{ scope.row.title }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column width="100" align="center">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    circle
                    @click="handleTodoEdit(scope.row.id, scope.row)"></el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
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
            <schart ref="bar" class="schart" canvasId="bar" :options="salesData.options"></schart>
          </el-card>
        </el-col>
        <!-- 折线图 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <schart ref="line" class="schart" canvasId="line" :options="salesData.options2"></schart>
          </el-card>
        </el-col>
        <!-- 饼状图, 注意, 数据本身就有一定的格式要求 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <schart ref="pie" class="schart" canvasId="pie" :options="salesData.options3"></schart>
          </el-card>
        </el-col>
        <!-- 环形图 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <schart ref="ring" class="schart" canvasId="ring" :options="salesData.options4"></schart>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 2. 编辑弹出框, 注意el-form-item中的prop实际上和rules中的key对应 -->
    <el-dialog title="编辑" :visible.sync="todoEditDialogVisible" width="30%">
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="todoEditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveTodoEdit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 3. 添加弹出框, 注意el-form-item中的prop实际上和rules中的key对应 -->
    <el-dialog title="添加" :visible.sync="todoAddDialogVisible" width="30%">
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="todoAddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveTodoAdd">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Schart from "vue-schart";

import SimpleApi from "@/api/simpleApi";
import Axiosapi from "@/utils/request";
import requestMixin from "@/mixins/requestMixin";
import CommonDateHandler from "@/utils/date";
import EventBus from "@/store/bus";
/*
页面: 管理后台控制台首页
 */
export default {
  name: "dashboard",
  mixins: [requestMixin],
  data() {
    return {
      dynamicBaseURL: Axiosapi.dynamicURL,
      loginName: localStorage.getItem("ms_username"),
      loginOther: JSON.parse(localStorage.getItem("ms_other")),

      // 待办事项相关变量
      todoList: [],
      todoPage: 1,
      todoPageSize: 5,
      todoTotal: 0,
      todoEditDialogVisible: false, // 对话框
      todoHandleId: 0,
      todoEditForm: {}, // 表单

      todoAddDialogVisible: false,
      todoAddForm: { title: "", desc: "", priority: 3 },

      salesData: { options: {}, options2: {}, options3: {}, options4: {} }, // 销售信息
      statisticsInfo: {
        // 统计信息, 确保子对象不为空, 否则开始就会报错
      },
    };
  },
  components: {
    Schart,
  },
  computed: {
    role() {
      return this.loginName === "admin" ? "超级管理员" : "普通用户";
    },
    loginLocation() {
      if (!this.loginOther.login_location) {
        return "-";
      }

      return this.loginOther.login_location.city + " / " + this.loginOther.login_location.country;
    },
  },
  // 实例创建完成后被立即调用, 此时还没开始，$el 属性目前不可见
  created() {
    this.getAllInfo();
    // 监听事件总线的某一个值
    EventBus.$on("dynamicURLChange", this.handleDynamicURLChange);
  },
  beforeDestroy() {
    // 取消监听
    EventBus.$off("dynamicURLChange", this.handleDynamicURLChange);
  },
  // 当点击"系统首页", 加载dashboard页面的时候, 该函数被调用
  activated() {
    this.getAllInfo();

    this.refreshInterval = setInterval(() => {
      this.getAllInfo();
    }, 60000);
  },
  // 当离开dashboard页面的时候被调用
  deactivated() {
    clearInterval(this.refreshInterval);
  },
  methods: {
    handleDynamicURLChange(newDynamicURLValue) {
      this.dynamicBaseURL = newDynamicURLValue;
    },
    isTodoItemDel(status) {
      return parseInt(status) === 3;
    },
    // 注意, 在请求期间, 数据仍然是初始状态, 所以html中需要兼容
    getAllInfo() {
      this.getTodoListInfos();
      this.getRecentSalesData();
      this.getStatisticsInfo();
    },
    // 自定义事件的方法。当"collapse"事件被触发时调用: 重新渲染图表
    handleBus(msg) {
      setTimeout(() => {
        this.renderChart();
      }, 200);
    },
    // 用于渲染图表的方法: 重新渲染柱状图, 重新渲染折线图
    renderChart() {
      this.$refs.bar.renderChart();
      this.$refs.line.renderChart();
    },

    handleTodoSizeChange(pageSize) {
      this.todoPageSize = pageSize;
      this.getStatisticsInfo();
    },
    handleTodoPageChange(page) {
      this.todoPage = page;
      this.getStatisticsInfo();
    },

    // 获取todolist
    getTodoListInfos() {
      SimpleApi.fetchTodoListInfos()
        .then((result) => {
          var _rspInfo = result.data;
          if (!this.checkRequestResult(_rspInfo, "获取todolist列表异常")) {
            return;
          }
          this.todoList = _rspInfo.data;
          this.todoPage = _rspInfo.pager.page;
          this.todoPageSize = _rspInfo.pager.pageSize;
          this.todoTotal = _rspInfo.pager.total;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    handleTodoEdit(todoId, row) {
      this.todoHandleId = todoId;
      const { id, title, desc, priority } = row;
      this.todoEditForm = { id, title, desc, priority };
      this.todoEditDialogVisible = true;
    },
    async handleTodoDelete(todoId, row) {
      try {
        await this.$confirm("确定要标记为删除吗？", "提示", {
          type: "warning",
        });
        const { data: result } = await SimpleApi.UpdateTodoOneInfos(todoId, {
          status: 4,
        });
        if (!this.checkRequestResult(result, "更新todo信息失败")) {
          return;
        }
        this.getTodoListInfos();
      } catch (error) {
        console.error("删除操作取消或出错:", error);
      }
    },
    async saveTodoEdit() {
      // 发起修改用户信息的数据请求
      const { data: result } = await SimpleApi.UpdateTodoOneInfos(this.todoEditForm.id, this.todoEditForm);
      if (!this.checkRequestResult(result, "更新todo信息失败")) {
        return;
      }
      this.todoEditDialogVisible = false;
      this.getTodoListInfos();
      this.$message.success("更新todo信息成功");
    },
    // 在勾选或取消勾选待办实现的时候触发回调
    async handleTodoCheckboxChange(row) {
      status = row.status == 3 ? 1 : 3;

      const { data: result } = await SimpleApi.UpdateTodoOneInfos(row.id, { status: parseInt(status) });
      if (!this.checkRequestResult(result, `更新待办事项(${row.title})信息失败`)) {
        return;
      }

      // 这种数组内的数据刷新不会触发自动刷新, 需要手动处理(注意status的类型)
      this.$set(row, "status", status);
    },
    // 添加新的代办事项
    handleTodoAdd() {
      this.todoAddForm = { title: "", desc: "", priority: 3 };
      this.todoAddDialogVisible = true;
    },
    async saveTodoAdd() {
      // 发起修改用户信息的数据请求
      const { data: result } = await this.$http.post("other/todos", this.todoAddForm);
      if (!this.checkRequestResult(result, "添加新待办事项失败")) {
        return;
      }
      this.todoAddDialogVisible = false;
      this.getTodoListInfos();
      this.$message.success("更新todo信息成功");
    },
    // 批量更新待办事项状态
    async updateTodoStatus(status) {
      const { data: result } = await this.$http.put(`other/todos/status/${status}`);
      if (!this.checkRequestResult(result, "添加新待办事项失败")) {
        return;
      }
    },
    handleTodoMulComplete() {
      this.updateTodoStatus(3);
      this.getTodoListInfos();
    },
    handleTodoMulDelete() {
      this.updateTodoStatus(4);
      this.getTodoListInfos();
    },

    // 获取最近一周各品类销售数据
    getRecentSalesData() {
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
          if (!this.checkRequestResult(_rspInfo, "获取最近一周各品类销售数据异常")) {
            return;
          }
          this.salesData = _rspInfo.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    // 获取网站的统计信息
    getStatisticsInfo() {
      SimpleApi.fetchStatisticsData()
        .then((result) => {
          var _rspInfo = result.data;
          if (!this.checkRequestResult(_rspInfo, "获取网站的统计信息异常")) {
            return;
          }
          this.statisticsInfo = _rspInfo.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
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
.todo-card-container >>> .el-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.todo-card-container >>> .el-table {
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

.schart {
  width: 100%;
  height: 300px;
}
</style>
