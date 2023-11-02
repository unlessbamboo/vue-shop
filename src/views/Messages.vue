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
              <template v-slot:default="scope">
                <span class="message-title">{{ scope.row.desc }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="publish_at" width="180"></el-table-column>

            <el-table-column width="120">
              <template v-slot:default="scope">
                <el-button size="small" @click="handleRead(scope.row.id)">标为已读</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 消息批量处理和分页 -->
          <div class="message-action-container">
            <div class="handle-row">
              <el-button type="primary" @click="handleUpdateAll(3)">全部标为已读</el-button>
            </div>
            <!-- 分页组件 -->
            <el-pagination
              v-if="unreadMessages.length > 0"
              layout="total, sizes, prev, pager, next"
              :total="total"
              :page-sizes="[5, 10, 20, 50, 100]"
              :page-size="pageSize"
              :current-page="currentPage"
              @size-change="handleUnreadSizeChange"
              @current-change="handleUnreadPageChange"></el-pagination>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="`已读消息(${messageStatistics.read})`" name="second">
          <template v-if="message === 'second'">
            <el-table :data="readMessages" :show-header="false" style="width: 100%">
              <el-table-column>
                <template v-slot:default="scope">
                  <span class="message-title">{{ scope.row.desc }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="publish_at" width="150"></el-table-column>
              <el-table-column width="120">
                <template v-slot:default="scope">
                  <el-button type="danger" @click="handleDel(scope.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="message-action-container">
              <div class="handle-row">
                <el-button type="danger" @click="handleUpdateAll(4)">删除全部</el-button>
              </div>
              <!-- 分页组件 -->
              <el-pagination
                v-if="readMessages.length > 0"
                :current-page="currentPage"
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
                <template v-slot:default="scope">
                  <span class="message-title">{{ scope.row.desc }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="publish_at" width="150"></el-table-column>
              <el-table-column width="120">
                <template v-slot:default="scope">
                  <el-button @click="handleRestore(scope.row.id)">还原</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="message-action-container">
              <div class="handle-row">
                <el-button type="danger" @click="handleUpdateAll(1)">清空回收站</el-button>
              </div>
              <!-- 分页组件 -->
              <el-pagination
                v-if="recycleMessages.length > 0"
                :current-page="currentPage"
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

<script setup name="tabs">
import { ref, onMounted, getCurrentInstance } from "vue";
import { ElMessageBox } from "element-plus";

import SimpleApi from "@/api/simpleApi";
import Axiosapi from "@/utils/request";
import { checkRequestResult } from "@/mixins/requestCommon";

// 全局变量
const { proxy } = getCurrentInstance();

const message = ref("first");
const showHeader = ref(false);
const messageStatistics = ref({});
const unreadMessages = ref([]);
const readMessages = ref([]);
const recycleMessages = ref([]);
const pageSize = ref(5); // 每页默认条数
const currentPage = ref(1); // 当前页码
const total = ref(0);

async function updateMessageStatus(messageId, messageStatus) {
  const { data: result } = await proxy.$http.put(`messages/updateone/${messageId}`, {
    new_status: messageStatus,
  });
  if (!checkRequestResult(result, "更新系统消息状态失败!")) {
    return;
  }
}
// 标记为已读
async function handleRead(id) {
  await updateMessageStatus(id, 3);
  getMessageStatistics();
  getUnreadMessages();
}
// 删除
async function handleDel(id) {
  await updateMessageStatus(id, 4);
  getMessageStatistics();
  getReadMessages();
}
// 还原
async function handleRestore(id) {
  await updateMessageStatus(id, 3);
  getMessageStatistics();
  getRecycleMessages();
}
async function handleUpdateAll(newStatus) {
  var oldStatus = 2;
  if (newStatus == 3) {
    oldStatus = 2;
  } else if (newStatus == 4) {
    oldStatus = 3;
  } else {
    oldStatus = 4;
  }

  const { data: result } = await proxy.$http.put(`messages/updateall`, {
    current_status: oldStatus,
    new_status: newStatus,
  });
  if (!checkRequestResult(result, "更新系统消息状态失败!")) {
    return;
  }

  if (newStatus == 3) {
    getUnreadMessages();
  } else if (newStatus == 4) {
    getReadMessages();
  } else {
    getRecycleMessages();
  }
  getMessageStatistics();
}
// 处理分页变化
function handleUnreadPageChange(page) {
  currentPage.value = page;
  getUnreadMessages();
}
function handleUnreadSizeChange(_pageSize) {
  pageSize.value = _pageSize;
  getUnreadMessages();
}
function handleReadPageChange(page) {
  currentPage.value = page;
  getReadMessages();
}
function handleReadSizeChange(_pageSize) {
  pageSize.value = _pageSize;
  getReadMessages();
}
function handleRecyclePageChange(page) {
  currentPage.value = page;
  getRecycleMessages();
}
function handleRecycleSizeChange(_pageSize) {
  pageSize.value = _pageSize;
  getRecycleMessages();
}

// 点击tab时触发
function handleTabClick(tab, event) {
  if (tab.paneName == "first") {
    getUnreadMessages();
  } else if (tab.paneName == "second") {
    getReadMessages();
  } else {
    getRecycleMessages();
  }
}

// 获取消息简要统计信息
async function getMessageStatistics() {
  const { data: result } = await SimpleApi.fetchMessageStatistics();
  if (!checkRequestResult(result, "获取系统消息简要统计信息失败!")) {
    return;
  }
  messageStatistics.value = result.data;
}
// 获取指定状态的消息列表
async function getMessagesByStatus(messageStatus) {
  const { data: result } = await proxy.$http.get("messages", {
    params: {
      page: currentPage.value,
      pagesize: pageSize.value,
      status: messageStatus,
    },
  });
  if (!checkRequestResult(result, "获取未读系统消息列表失败!")) {
    return null;
  }
  total.value = result.pager.total;
  currentPage.value = result.pager.page;
  pageSize.value = result.pager.pageSize;
  return result.data;
}
// 获取未读消息列表
async function getUnreadMessages() {
  let messages = await getMessagesByStatus(2);
  if (messages) {
    unreadMessages.value = messages;
  }
}
// 获取已读消息列表
async function getReadMessages() {
  let messages = await getMessagesByStatus(3);
  if (messages) {
    readMessages.value = messages;
  }
}
// 获取回收站消息列表
async function getRecycleMessages() {
  let messages = await getMessagesByStatus(4);
  if (messages) {
    recycleMessages.value = messages;
  }
}

// @function: 生命周期
onMounted(() => {
  // 消息简要信息
  getMessageStatistics();
  // 获取消息列表
  getUnreadMessages();
});
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
