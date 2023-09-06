<template>
  <div class="">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-copy"></i>
          系统消息
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-tabs v-model="message" @tab-click="handleTabClick">
        <el-tab-pane :label="`未读消息(${messageStatistics.unread})`" name="first">
          <el-table :data="unreadMessages" :show-header="false" style="width: 100%">
            <el-table-column>
              <template slot-scope="scope">
                <span class="message-title">{{ scope.row.desc }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="publish_at" width="180"></el-table-column>

            <el-table-column width="120">
              <template slot-scope="scope">
                <el-button size="small" @click="handleRead(scope.row.id)">标为已读</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 消息批量处理和分页 -->
          <div class="message-action-container">
            <div class="handle-row">
              <el-button type="primary">全部标为已读</el-button>
            </div>
            <!-- 分页组件 -->
            <el-pagination
              v-if="unreadMessages.length > 0"
              layout="total, sizes, prev, pager, next"
              :total="total"
              :page-sizes="[5, 10, 20, 50, 100]"
              :page-size="pageSize"
              :current-page="page"
              @size-change="handleUnreadSizeChange"
              @current-change="handleUnreadPageChange"></el-pagination>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="`已读消息(${messageStatistics.read})`" name="second">
          <template v-if="message === 'second'">
            <el-table :data="readMessages" :show-header="false" style="width: 100%">
              <el-table-column>
                <template slot-scope="scope">
                  <span class="message-title">{{ scope.row.desc }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="publish_at" width="150"></el-table-column>
              <el-table-column width="120">
                <template slot-scope="scope">
                  <el-button type="danger" @click="handleDel(scope.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="message-action-container">
              <div class="handle-row">
                <el-button type="danger">删除全部</el-button>
              </div>
              <!-- 分页组件 -->
              <el-pagination
                v-if="readMessages.length > 0"
                :current-page="page"
                :page-size="pageSize"
                layout="total, prev, pager, next"
                :total="total"
                @size-change="handleReadSizeChange"
                @current-change="handleReadPageChange"></el-pagination>
            </div>
          </template>
        </el-tab-pane>

        <el-tab-pane :label="`回收站(${messageStatistics.recycle})`" name="third">
          <template v-if="message === 'third'">
            <el-table :data="recycleMessages" :show-header="false" style="width: 100%">
              <el-table-column>
                <template slot-scope="scope">
                  <span class="message-title">{{ scope.row.desc }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="publish_at" width="150"></el-table-column>
              <el-table-column width="120">
                <template slot-scope="scope">
                  <el-button @click="handleRestore(scope.row.id)">还原</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="message-action-container">
              <div class="handle-row">
                <el-button type="danger">清空回收站</el-button>
              </div>
              <!-- 分页组件 -->
              <el-pagination
                v-if="recycleMessages.length > 0"
                :current-page="page"
                :page-size="pageSize"
                layout="prev, pager, next"
                :total="total"
                @size-change="handleRecycleSizeChange"
                @current-change="handleRecyclePageChange"></el-pagination>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import SimpleApi from "@/api/simpleApi";
import requestMixin from "@/mixins/requestMixin";

export default {
  name: "tabs",
  mixins: [requestMixin],
  data() {
    return {
      message: "first",
      showHeader: false,
      messageStatistics: {},
      unreadMessages: [],
      readMessages: [],
      recycleMessages: [],
      pageSize: 5, // 每页默认条数
      page: 1, // 当前页码
      total: 0,
    };
  },
  methods: {
    async updateMessageStatus(messageId, messageStatus) {
      const { data: result } = await this.$http.put(`messages/updateone/${messageId}`, {
        status: messageStatus,
      });
      if (!this.checkRequestResult(result, "更新系统消息状态失败!")) {
        return;
      }
    },
    // 标记为已读
    async handleRead(id) {
      await this.updateMessageStatus(id, 3);
      this.getMessageStatistics();
      this.getUnreadMessages();
    },
    // 删除
    async handleDel(id) {
      await this.updateMessageStatus(id, 4);
      this.getMessageStatistics();
      this.getReadMessages();
    },
    // 还原
    async handleRestore(id) {
      await this.updateMessageStatus(id, 3);
      this.getMessageStatistics();
      this.getRecycleMessages();
    },
    // 处理分页变化
    handleUnreadPageChange(page) {
      this.page = page;
      this.getUnreadMessages();
    },
    handleUnreadSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getUnreadMessages();
    },
    handleReadPageChange(page) {
      this.readPage = page;
      this.getReadMessages();
    },
    handleReadSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getReadMessages();
    },
    handleRecyclePageChange(page) {
      this.recyclePage = page;
      this.getCycleMessages();
    },
    handleRecycleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getRecycleMessages();
    },

    // 点击tab时触发
    handleTabClick(tab, event) {
      if (tab.name == "first") {
        this.getUnreadMessages();
      } else if (tab.name == "second") {
        this.getReadMessages();
      } else {
        this.getRecycleMessages();
      }
    },

    // 获取消息简要统计信息
    async getMessageStatistics() {
      const { data: result } = await SimpleApi.fetchMessageStatistics();
      if (!this.checkRequestResult(result, "获取系统消息简要统计信息失败!")) {
        return;
      }
      this.messageStatistics = result.data;
    },
    // 获取指定状态的消息列表
    async getMessagesByStatus(messageStatus) {
      const { data: result } = await this.$http.get("messages", {
        params: {
          page: this.page,
          pagesize: this.pageSize,
          status: messageStatus,
        },
      });
      if (!this.checkRequestResult(result, "获取未读系统消息列表失败!")) {
        return;
      }
      this.total = result.pager.total;
      this.page = result.pager.page;
      this.pageSize = result.pager.pageSize;
      return result.data;
    },
    // 获取未读消息列表
    async getUnreadMessages() {
      let messages = await this.getMessagesByStatus(2);
      if (messages) {
        this.unreadMessages = messages;
      }
    },
    // 获取已读消息列表
    async getReadMessages() {
      let messages = await this.getMessagesByStatus(3);
      if (messages) {
        this.readMessages = messages;
      }
    },
    // 获取回收站消息列表
    async getRecycleMessages() {
      let messages = await this.getMessagesByStatus(4);
      if (messages) {
        this.recycleMessages = messages;
      }
    },
  },
  created() {
    // 消息简要信息
    this.getMessageStatistics();
    // 获取消息列表
    this.getUnreadMessages();
  },
  computed: {},
};
</script>

<style>
.message-title {
  cursor: pointer;
}
.handle-row {
  margin-right: 10px;
  right: 0px;
}

.message-action-container {
  display: flex;
  margin-top: 30px;
  align-items: center;
  justify-content: space-between;
}
.message-action-pagination {
  /* 为了确保后续版式不乱, 可以设置el-patination显示为hidden而不是none */
  visibility: hidden;
}
</style>
