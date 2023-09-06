<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="addForm.name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="price">
              <el-input v-model="addForm.price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="weight">
              <el-input v-model="addForm.weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="number">
              <el-input v-model="addForm.number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="categories">
              <el-cascader
                v-model="addForm.categories"
                :options="cateList"
                :props="casteProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
            <div class="next-page-button">
              <el-button @click="handleNextOrPrevPage('next')">下一页</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.id">
              <el-checkbox-group v-model="item.values">
                <el-checkbox v-for="(cb, index) in item.values" :key="index" :label="cb" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <div class="next-page-button">
              <el-button @click="handleNextOrPrevPage('prev')">上一页</el-button>
              <el-button @click="handleNextOrPrevPage('next')">下一页</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.id">
              <el-input v-model="item.values"></el-input>
            </el-form-item>
            <div class="next-page-button">
              <el-button @click="handleNextOrPrevPage('prev')">上一页</el-button>
              <el-button @click="handleNextOrPrevPage('next')">下一页</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <div class="upload-image-container">
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </div>
            <div class="next-page-button">
              <el-button @click="handleNextOrPrevPage('prev')">上一页</el-button>
              <el-button @click="handleNextOrPrevPage('next')">下一页</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
            <div class="goods-editor">
              <quill-editor v-model="addForm.introduce"></quill-editor>
            </div>
            <div class="add-good-button">
              <el-button class="btnAdd" @click="add" type="primary">添加商品</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="priviewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import axiosapi from "@/utils/request";
import requestMixin from "@/mixins/requestMixin";
import categoryMixin from "@/mixins/categoryMixin";

export default {
  mixins: [requestMixin, categoryMixin],
  data() {
    return {
      activeIndex: "0",
      addForm: {
        name: "",
        price: 0,
        weight: 0,
        number: 0,
        // 商品所属的分类数组
        categories: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        introduce: "",
        attrs: [],
      },
      addFormRules: {
        name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
        price: [{ required: true, message: "请输入商品价格", trigger: "blur" }],
        weight: [{ required: true, message: "请输入商品重量", trigger: "blur" }],
        number: [{ required: true, message: "请输入商品数量", trigger: "blur" }],
        categories: [{ required: true, message: "请选择商品分类", trigger: "blur" }],
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: axiosapi.uploadURL + "/api/v1/goods/upload",
      // 图片上传组件的header请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",
      previewVisible: false,
    };
  },
  created() {
    this.getCateSimpleList();
  },
  methods: {
    // 级联选择器选中会触发
    handleChange() {
      if (this.addForm.categories.length !== 3) {
        this.addForm.categories = [];
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.categories.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data: result } = await this.$http.get(`goods/categories/${this.cateId}/attributes`, {
          params: { select: "many" },
        });
        if (!this.checkRequestResult(result, "获取状态参数列表失败！")) {
          return;
        }
        result.data.forEach((item) => {
          item.values = item.values.length === 0 ? [] : item.values.split(" ");
        });
        this.manyTableData = result.data;
      } else if (this.activeIndex === "2") {
        const { data: result } = await this.$http.get(`goods/categories/${this.cateId}/attributes`, {
          params: { select: "only" },
        });
        if (!this.checkRequestResult(result, "获取状态参数列表失败！")) {
          return;
        }
        result.data.forEach((item) => {
          item.values = item.values.length === 0 ? [] : item.values;
        });
        this.onlyTableData = result.data;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },

    /*
     * 处理移除图片的操作, 其操作:
     *  a. 获取将要删除的照片路径
     *  b. 在图片列表中匹配并找到相应的元素并进行删除
     */
    handleRemove(file) {
      const filePath = file.response.data.pics_big;
      const i = this.addForm.pics.findIndex((x) => x.pics_big === filePath);
      this.addForm.pics.splice(i, 1);
    },

    /*
     * 功能: 拼接图片信息对象并将其Push到pics数组中
     */
    handleSuccess(response) {
      this.addForm.pics.push(response.data);
    },

    /*
     * 功能: 添加商品
     */
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("填写必要的表单项！");
        }
        // 执行添加的业务逻辑
        const form = _.cloneDeep(this.addForm);
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            id: item.id,
            values: item.values.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            id: item.id,
            values: item.values,
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        // 发起请求添加商品
        // 商品的名称必须是唯一的
        const { data: result } = await this.$http.post("goods", form);
        if (!this.checkRequestResult(result, "添加商品失败")) {
          return;
        }
        this.$message.success("添加商品成功");
        this.$router.push("/goods");
      });
    },
    /*
     * 上/下一页事件处理函数
     */
    handleNextOrPrevPage(action) {
      var isEnable = false;
      if (action == "prev") {
        if (this.activeIndex > 0) {
          this.activeIndex = (parseInt(this.activeIndex) - 1).toString();
          isEnable = true;
        }
      } else {
        if (this.activeIndex < 4) {
          this.activeIndex = (parseInt(this.activeIndex) + 1).toString();
          isEnable = true;
        }
      }

      // 表示此时tab也发生了变动
      if (isEnable) {
        this.tabClicked();
      }
    },
  },
  computed: {
    cateId() {
      if (this.addForm.categories.length === 3) {
        return this.addForm.categories[2];
      }
      return null;
    },
  },
};
</script>

<style scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.priviewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}

/* 上传照片按钮 */
.upload-image-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;
  height: 100%; /* 根据需要设置高度 */
}

/* 编辑框内容样式调整 */
.quill-editor >>> .ql-container {
  min-height: 380px;
}

/* 添加商品按钮的样式 */
.add-good-button {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 为了让el-button始终在底部, 设置el-tabs和el-table-pane最小高度 */
.el-tabs >>> .el-tabs__content {
  height: 500px;
}
.el-tabs >>> .el-tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.next-page-button {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* 或者您可以设置一个特定的高度 */
}
/* 在Flexbox布局中，auto值的边距会吸收任何额外的可用空间, 所以，当我们说 margin-top: auto; 
   我们实际上是告诉浏览器：“把所有可用的垂直空间都作为这个元素的顶部边距”
*/
.next-page-button .el-button {
  margin-top: auto;
}
</style>
