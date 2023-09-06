<template>
  <div>
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
            <span>{{ loginOther.login_time }}</span>
          </div>
          <div class="user-info-list">
            上次登录地点：
            <span>{{ loginLocation }}</span>
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
          Vue
          <el-progress :percentage="statisticsInfo.languages.vue || 0" color="#42b983"></el-progress>
          JavaScript
          <el-progress :percentage="statisticsInfo.languages.javascript || 0" color="#f1e05a"></el-progress>
          CSS
          <el-progress :percentage="statisticsInfo.languages.css || 0"></el-progress>
          HTML
          <el-progress :percentage="statisticsInfo.languages.html || 0" color="#f56c6c"></el-progress>
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
        <el-card shadow="hover" style="height: 403px">
          <div slot="header" class="clearfix">
            <span>待办事项</span>
            <el-button style="float: right; padding: 3px 0" type="text">添加</el-button>
          </div>
          <el-table :show-header="false" :data="todoList" style="width: 100%">
            <el-table-column width="40">
              <template slot-scope="scope">
                <el-checkbox v-model="scope.row.status"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column>
              <template slot-scope="scope">
                <div class="todo-item" :class="{ 'todo-item-del': scope.row.status }">{{ scope.row.title }}</div>
              </template>
            </el-table-column>
            <el-table-column width="60">
              <template>
                <i class="el-icon-edit"></i>
                <i class="el-icon-delete"></i>
              </template>
            </el-table-column>
          </el-table>
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
</template>

<script>
import Schart from "vue-schart";

import SimpleApi from "@/api/simpleApi";
import requestMixin from "@/mixins/requestMixin";
import CommonDateHandler from "@/utils/date";
import bus from "@/store/bus";
/*
页面: 管理后台控制台首页
 */
export default {
  name: "dashboard",
  mixins: [requestMixin],
  data() {
    return {
      loginName: localStorage.getItem("ms_username"),
      loginOther: JSON.parse(localStorage.getItem("ms_other")),
      todoList: [],
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
  },
  // 当点击"系统首页", 加载dashboard页面的时候, 该函数被调用
  activated() {
    this.getAllInfo();

    this.refreshInterval = setInterval(() => {
      this.getAllInfo();
    }, 5000);
  },
  // 当离开dashboard页面的时候被调用
  deactivated() {
    clearInterval(this.refreshInterval);
  },
  methods: {
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

    // 获取todolist
    getTodoListInfos() {
      SimpleApi.fetchTodoListInfos()
        .then((result) => {
          var _rspInfo = result.data;
          if (!this.checkRequestResult(_rspInfo, "获取todolist列表异常")) {
            return;
          }
          this.todoList = _rspInfo.data;
        })
        .catch((error) => {
          console.log(error);
        });
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
          console.log(result);
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
  margin-bottom: 20px;
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
  line-height: 25px;
}

.user-info-list span {
  margin-left: 70px;
}

.mgb20 {
  margin-bottom: 20px;
}

.todo-item {
  font-size: 14px;
}

.todo-item-del {
  text-decoration: line-through;
  color: #999;
}

.schart {
  width: 100%;
  height: 300px;
}
</style>
