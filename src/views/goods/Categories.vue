<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域
      tree-table表格区域 
          :data(设置数据源) 
          :columns(设置表格中列配置信息) 
          :selection-type(是否有复选框) 
          :expand-type(是否展开数据) 
          show-index(是否设置索引列) 
          index-text(设置索引列头) 
          border(是否添加纵向边框) 
          :show-row-hover(是否鼠标悬停高亮)
    -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text=""
        border
        class="treetable">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 级别 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">
            编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.id)">
            删除
          </el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="name">
          <el-input v-model="addCateForm.name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类名称的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="name">
          <el-input v-model="editCateForm.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SimpleApi from "@/api/simpleApi";
import requestMixin from "@/mixins/requestMixin";
import categoryMixin from "@/mixins/categoryMixin";

export default {
  mixins: [requestMixin, categoryMixin],
  data() {
    return {
      total: 0, // 总数据条数
      // 查询条件
      queryInfo: {
        level: 3, // 表示获取的最大层级
        page: 1,
        pagesize: 5,
      },

      // 为table指定列的定义，在数据中添加columns
      columns: [
        {
          label: "分类名称",
          prop: "name", // 对应列内容的属性名称
        },
        {
          label: "是否有效",
          type: "template", // 表示将当前列定义为模板列
          template: "isok", // 表示当前这一列使用模板名称
        },
        {
          label: "等级",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],

      addCateDialogVisible: false, // 控制添加分类对话框的显示与隐藏
      // 添加分类的表单数据对象
      addCateForm: {
        name: "", // 将要添加分类的名称
        pid: 0, // 父级分类的id
        level: 0, // 分类的等级，默认添加的是一级分类
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
      },
      parentCateList: [], // 父级分类的列表
      selectedKeys: [], // 选中的父级分类的id数组
      editDialogVisible: false, // 控制修改分类名称对话框的显示与隐藏
      editCateForm: {},
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: result } = await this.$http.get("goods/categories", {
        params: this.queryInfo,
      });
      if (!this.checkRequestResult(result, "获取商品分类失败！")) {
        return;
      }
      this.cateList = result.data;
      // 为总数据条数赋值
      this.total = result.pager.total;
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList(); // 刷新数据
    },
    // 监听page改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage;
      this.getCateList();
    },
    // 点击按钮，显示对话框
    showAddCatDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList();
      // 再展示对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级(2级)分类的数据列表
    async getParentCateList() {
      const { data: result } = await this.$http.get("goods/categories/simpleinfo", {
        params: { level: 2 },
      });
      if (!this.checkRequestResult(result, "获取父级分类数据失败！")) {
        return;
      }
      this.parentCateList = result.data.infos;
    },
    /*
     * 功能: 选择项发生变化触发
     *  selectKeys数组长度:
     *    + >0，证明选中的父级分类
     *    + =0, 说明没有选中任何父级分类
     */
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.pid = this.selectedKeys[this.selectedKeys.length - 1];
        this.addCateForm.level = this.selectedKeys.length;
      } else {
        this.addCateForm.pid = 0;
        this.addCateForm.level = 0;
      }
    },
    // 点击确定按钮添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("表单预校验失败！");
        const { data: result } = await this.$http.post("goods/categories", this.addCateForm);
        if (!this.checkRequestResult(result, "添加分类失败！")) {
          return;
        }
        this.$message.success("添加分类成功");
        // 刷新列表
        this.getCateList();
        // 隐藏对话框
        this.addCateDialogVisible = false;
      });
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.level = 0;
      this.addCateForm.pid = 0;
    },
    // 展示编辑分类名称的对话框
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: result } = await this.$http.get(`goods/categories/${id}`);
      if (!this.checkRequestResult(result, "查询分类数据失败！")) {
        return;
      }
      console.log(result.data);
      this.editCateForm = result.data;
    },
    // 监听修改分类名称对话框的关闭事件
    editDialogClosed() {
      this.$refs.editCateFormRef.resetFields();
    },
    // 修改分类名称信息，并提交
    editCateInfo() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return;
        // 发起修改分类名称的数据请求
        const { data: result } = await this.$http.put(`goods/categories/${this.editCateForm.id}`, {
          name: this.editCateForm.name,
        });
        if (!this.checkRequestResult(result, "更新分类名称失败！")) {
          return;
        }
        // 关闭对话框
        this.editDialogVisible = false;
        // 重新获取用户列表
        this.getCateList();
        // 提示修改成功
        this.$message.success("更新分类名称成功！");
      });
    },
    async removeCateById(id) {
      // 弹框提示用户是否删除数据
      const confirmResult = await this.$confirm("此操作将永久删除该分类，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((error) => error);
      if (confirmResult !== "confirm") {
        return this.$message.info("已经取消删除");
      }
      const { data: result } = await this.$http.delete("goods/categories/" + id);
      if (!this.checkRequestResult(result, "删除分类失败")) {
        return;
      }
      this.$message.success("删除分类成功");
      this.getCateList();
    },
  },
};
</script>

<style scoped>
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
