<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <template v-slot:append>
              <el-button :icon="Search"></el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="id"></el-table-column>
        <el-table-column label="订单价格" prop="price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot:default="scope">
            <el-tag type="success" v-if="scope.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_at">
          <template v-slot:default="scope">
            {{ $filters.dateFormat(scope.row.create_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button :icon="Edit" size="small" type="primary" @click="showBox"></el-button>
            <el-button icon="Location" size="small" type="success" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background></el-pagination>
    </el-card>

    <!-- 修改修改地址的对话框 -->
    <el-dialog title="修改地址" v-model="addressVisible" width="50%" @close="addressDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="provinceInfo" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="addressVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressVisible = false">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" v-model="progressVisible" width="50%">
      <!-- 内容主体区域 时间线 -->
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup name="order">
import { reactive, ref, onMounted, toRefs, computed, getCurrentInstance, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Delete, Edit, Setting, Search, ArrowRight, Location } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { checkRequestResult } from "@/mixins/requestCommon";
import categoryMixin from "@/mixins/categoryMixin";
import provinceInfo from "@/data/province";
import SimpleApi from "@/api/simpleApi";
import db from "./db.js";

// 全局变量
const { proxy } = getCurrentInstance();
const router = useRouter();

// 复用composition变量
const { cateList, casteProps, cascaderProps, getCateSimpleList } = categoryMixin();
const addressFormRef = ref(null);

/*
全局变量
*/
const queryInfo = ref({
  query: "",
  page: 1,
  pagesize: 10,
});
const total = ref(0);
const orderList = ref([]);
const addressVisible = ref(false);
const addressForm = ref({
  address1: [],
  address2: "",
});
const addressFormRules = ref({
  address1: [{ required: true, message: "请选择省市区县", trigger: "blur" }],
  address2: [{ required: true, message: "请输入详细地址", trigger: "blur" }],
});
const progressVisible = ref(false);
const progressInfo = ref([]);

/*
声明周期和computed
*/
onMounted(() => {
  getOrderList();
});

/*
method
*/
async function getOrderList() {
  const { data: result } = await proxy.$http.get("order", {
    params: queryInfo.value,
  });
  if (!checkRequestResult(result, "获取订单列表失败")) {
    return;
  }
  total.value = result.pager.total;
  orderList.value = result.data;
}
function handleSizeChange(newSize) {
  queryInfo.value.pagesize = newSize;
  getOrderList();
}
function handleCurrentChange(newPage) {
  queryInfo.value.page = newPage;
  getOrderList();
}
// 展示修改地址的对话框
function showBox() {
  addressVisible.value = true;
}
function addressDialogClosed() {
  addressFormRef.value.resetFields();
}
function showProgressBox() {
  progressInfo.value = db;
  progressVisible.value = true;
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
