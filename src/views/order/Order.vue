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
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="id"></el-table-column>
        <el-table-column label="订单价格" prop="price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_at">
          <template slot-scope="scope">
            {{ $filters.dateFormat(scope.row.create_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button icon="el-icon-edit" size="small" type="primary" @click="showBox"></el-button>
            <el-button icon="el-icon-location" size="small" type="success" @click="showProgressBox"></el-button>
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
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

<script>
import provinceInfo from "@/data/province";
import SimpleApi from "@/api/simpleApi";
import requestMixin from "@/mixins/requestMixin";
import db from "./db.js";

export default {
  mixins: [requestMixin],
  data() {
    return {
      queryInfo: {
        query: "",
        page: 1,
        pagesize: 10,
      },
      total: 0,
      orderList: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: "",
      },
      addressFormRules: {
        address1: [{ required: true, message: "请选择省市区县", trigger: "blur" }],
        address2: [{ required: true, message: "请输入详细地址", trigger: "blur" }],
      },
      provinceInfo,
      progressVisible: false,
      progressInfo: [],
      db,
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: result } = await this.$http.get("order", {
        params: this.queryInfo,
      });
      if (!checkRequestResult(result, "获取订单列表失败")) {
        return;
      }
      this.total = result.pager.total;
      this.orderList = result.data;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage;
      this.getOrderList();
    },
    // 展示修改地址的对话框
    showBox() {
      this.addressVisible = true;
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    showProgressBox() {
      this.progressInfo = this.db;
      this.progressVisible = true;
      console.log(this.progressInfo);
    },
  },
};
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
