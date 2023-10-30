<template>
  <div>
    <!-- 1. 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.name"
            clearable
            @clear="getGoodsList"
            @change="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="price" width="90px"></el-table-column>
        <el-table-column label="商品重量" prop="weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="create_at" width="145px">
          <template slot-scope="scope">
            {{ $filters.dateFormat(scope.row.create_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- a. 编辑 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditGoodsDialog(scope.row)"></el-button>
            <!-- b. 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background></el-pagination>
    </el-card>

    <!-- 3. 添加角色的对话框 -->
    <el-dialog title="修改商品" v-model="editGoodsDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editGoodsForm" :rules="editGoodsFormRules" ref="editGoodsFormRef" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="editGoodsForm.name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input v-model="editGoodsForm.price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="weight">
          <el-input v-model="editGoodsForm.weight"></el-input>
        </el-form-item>
        <el-form-item label="商品描述" prop="introduce">
          <el-input v-model="editGoodsForm.introduce"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SimpleApi from "@/api/simpleApi";
import { ElMessageBox } from "element-plus";
import { checkRequestResult } from "@/mixins/requestCommon";

export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        name: "",
        page: 1,
        pagesize: 10,
      },

      // 控制修改商品对话框的显示与隐藏
      editGoodsDialogVisible: false,
      editGoodsForm: { name: "", price: 0, weight: 0.0 },
      editGoodsFormRules: {
        name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        desc: [{ message: "请输入角色描述", trigger: "blur" }],
      },

      // 商品列表
      goodsList: [],
      // 总数据条数
      total: 0,
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: result } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (!checkRequestResult(result, "获取商品列表失败！")) {
        return;
      }
      $eMessage.success("获取商品列表成功！");
      this.goodsList = result.data;
      this.total = result.pager.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage;
      this.getGoodsList();
    },
    async removeById(id) {
      const confirmResult = await ElMessageBox.confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((error) => error);
      if (confirmResult !== "confirm") {
        return $eMessage.info("已取消删除！");
      }
      const { data: result } = await this.$http.delete(`goods/${id}`);
      if (!checkRequestResult(result, "删除失败！")) {
        return;
      }
      $eMessage.success("删除成功！");
      this.getGoodsList();
    },
    goAddPage() {
      this.$router.push("/goods/add");
    },
    /*
     * 功能: 商品编辑
     */
    editGoodsInfo() {
      this.$refs.editGoodsFormRef.validate(async (valid) => {
        if (!valid) return;

        const { data: result } = await this.$http.put("goods/" + this.editGoodsForm.id, this.editGoodsForm);
        if (!checkRequestResult(result, "更新商品信息失败")) {
          return;
        }
        // 关闭对话框
        this.editGoodsDialogVisible = false;
        // 重新获取用户列表
        this.getGoodsList();
        // 提示修改成功
        $eMessage.success("更新角色信息成功");
      });
    },
    /*
     * 功能: 点击编辑, 将当前行数据复制给editGoodsForm并启动对话框
     */
    showEditGoodsDialog(good) {
      this.editGoodsDialogVisible = true;
      Object.assign(this.editGoodsForm, {
        id: good["id"],
        name: good["name"],
        price: good["price"],
        weight: good["weight"],
        introduce: good["introduce"],
      });
    },
  },
};
</script>

<style scoped></style>
